import { Module } from '@nestjs/common';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';
import { PrismaService } from '@zoom/shared';

@Module({
    controllers: [MeetingController],
    providers: [MeetingService, PrismaService],
})
export class MeetingModule { }
