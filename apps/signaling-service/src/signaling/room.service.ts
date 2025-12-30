import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RoomService {
    private redis: Redis;

    constructor() {
        // In prod, use env vars
        this.redis = new Redis({
            host: 'localhost',
            port: 6379,
            lazyConnect: true // Don't crash if redis isn't up in dev immediately
        });
    }

    async addParticipant(meetingId: string, socketId: string, userId: string) {
        const key = `meeting:${meetingId}:participants`;
        await this.redis.hset(key, socketId, userId);
        // Map socket to meeting for quick disconnect handling
        await this.redis.set(`socket:${socketId}:meeting`, meetingId);
        await this.redis.set(`socket:${socketId}:user`, userId);
    }

    async removeParticipant(socketId: string) {
        const meetingId = await this.redis.get(`socket:${socketId}:meeting`);
        const userId = await this.redis.get(`socket:${socketId}:user`);

        if (meetingId && userId) {
            await this.redis.hdel(`meeting:${meetingId}:participants`, socketId);
            await this.redis.del(`socket:${socketId}:meeting`);
            await this.redis.del(`socket:${socketId}:user`);
            return { meetingId, userId };
        }
        return null;
    }

    async getParticipants(meetingId: string) {
        const participants = await this.redis.hgetall(`meeting:${meetingId}:participants`);
        return participants;
    }
}
