import { Module } from '@nestjs/common';
import { SignalingGateway } from './signaling.gateway';
import { RoomService } from './room.service';

@Module({
    providers: [SignalingGateway, RoomService],
})
export class SignalingModule { }
