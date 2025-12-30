import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from './room.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class SignalingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private roomService: RoomService) { }

    handleConnection(client: Socket) {
        console.log('Client connected:', client.id);
    }

    async handleDisconnect(client: Socket) {
        console.log('Client disconnected:', client.id);
        const result = await this.roomService.removeParticipant(client.id);
        if (result) {
            this.server.to(result.meetingId).emit('participant-left', { userId: result.userId });
        }
    }

    @SubscribeMessage('join-room')
    async handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { meetingId: string; userId: string; name: string }
    ) {
        await this.roomService.addParticipant(data.meetingId, client.id, data.userId);
        client.join(data.meetingId);

        // Notify others
        client.to(data.meetingId).emit('participant-joined', {
            userId: data.userId,
            socketId: client.id,
            name: data.name
        });

        // Send existing participants to new joiner
        const participants = await this.roomService.getParticipants(data.meetingId);
        return { participants };
    }

    @SubscribeMessage('chat-message')
    handleChatMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { meetingId: string; content: string; senderName: string }) {
        this.server.to(data.meetingId).emit('chat-message', {
            senderId: client.id,
            senderName: data.senderName,
            content: data.content,
            timestamp: new Date(),
        });
    }
}
