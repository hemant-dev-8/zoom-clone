import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MediaService } from './media.service';
import * as mediasoup from 'mediasoup';

@WebSocketGateway({ cors: { origin: '*' } })
export class MediaGateway {
    @WebSocketServer() server: Server;

    // Store transports: socketId -> custom obj
    private transports = new Map<string, mediasoup.types.WebRtcTransport>();
    private producers = new Map<string, mediasoup.types.Producer>();
    private consumers = new Map<string, mediasoup.types.Consumer>();

    constructor(private mediaService: MediaService) { }

    @SubscribeMessage('join-as-speaker')
    async handleJoinSpeaker(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { meetingId: string }
    ) {
        const router = await this.mediaService.getRouter(data.meetingId);
        return { rtpCapabilities: router.rtpCapabilities };
    }

    @SubscribeMessage('create-transport')
    async createTransport(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { meetingId: string; consuming: boolean }
    ) {
        const { transport, params } = await this.mediaService.createWebRtcTransport(data.meetingId);

        // Save transport securely mapped to client
        this.transports.set(transport.id, transport);

        transport.on('dtlsstatechange', (dtlsState) => {
            if (dtlsState === 'closed') transport.close();
        });

        return params;
    }

    @SubscribeMessage('connect-transport')
    async connectTransport(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { transportId: string; dtlsParameters: any }
    ) {
        const transport = this.transports.get(data.transportId);
        if (!transport) throw new Error('Transport not found');
        await transport.connect({ dtlsParameters: data.dtlsParameters });
        return { connected: true };
    }

    @SubscribeMessage('produce')
    async produce(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { transportId: string; kind: 'audio' | 'video'; rtpParameters: any; appData: any }
    ) {
        const transport = this.transports.get(data.transportId);
        if (!transport) throw new Error('Transport not found');

        const producer = await transport.produce({
            kind: data.kind,
            rtpParameters: data.rtpParameters,
            appData: data.appData,
        });

        this.producers.set(producer.id, producer);

        // Basic broadcasting to room - optimization: signaling service handles this usually
        // But here we might need to tell others "new producer"
        client.broadcast.to(data.appData.meetingId).emit('new-producer', { producerId: producer.id });

        return { id: producer.id };
    }

    @SubscribeMessage('consume')
    async consume(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { transportId: string; producerId: string; rtpCapabilities: any }
    ) {
        const transport = this.transports.get(data.transportId);
        if (!transport) throw new Error('Transport not found');

        const router = await this.mediaService.getRouter(transport.appData.meetingId as string); // Need to store meetingId in transport appData or pass it

        if (!router.canConsume({ producerId: data.producerId, rtpCapabilities: data.rtpCapabilities })) {
            throw new Error('Cannot consume');
        }

        const consumer = await transport.consume({
            producerId: data.producerId,
            rtpCapabilities: data.rtpCapabilities,
            paused: true,
        });

        this.consumers.set(consumer.id, consumer);

        return {
            id: consumer.id,
            producerId: data.producerId,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
        };
    }

    @SubscribeMessage('resume-consumer')
    async resumeConsumer(@MessageBody() data: { consumerId: string }) {
        const consumer = this.consumers.get(data.consumerId);
        if (consumer) await consumer.resume();
    }
}
