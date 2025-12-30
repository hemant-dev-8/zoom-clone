import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mediasoup from 'mediasoup';
import { config } from '../config';

@Injectable()
export class MediaService implements OnModuleInit {
    private worker: mediasoup.types.Worker;
    private routers: Map<string, mediasoup.types.Router> = new Map();

    async onModuleInit() {
        this.worker = await mediasoup.createWorker({
            logLevel: config.mediasoup.worker.logLevel as any,
            logTags: config.mediasoup.worker.logTags as any,
            rtcMinPort: config.mediasoup.worker.rtcMinPort,
            rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
        });

        this.worker.on('died', () => {
            console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', this.worker.pid);
            setTimeout(() => process.exit(1), 2000);
        });

        console.log('Mediasoup Worker created [pid:%d]', this.worker.pid);
    }

    async getRouter(meetingId: string): Promise<mediasoup.types.Router> {
        if (this.routers.has(meetingId)) {
            return this.routers.get(meetingId);
        }
        const router = await this.worker.createRouter({ mediaCodecs: config.mediasoup.router.mediaCodecs as any });
        this.routers.set(meetingId, router);
        return router;
    }

    async createWebRtcTransport(meetingId: string) {
        const router = await this.getRouter(meetingId);
        const transport = await router.createWebRtcTransport(config.mediasoup.webRtcTransport);

        return {
            params: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters,
            },
            transport,
        };
    }
}
