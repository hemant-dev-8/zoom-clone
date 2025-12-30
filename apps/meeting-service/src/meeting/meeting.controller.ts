import { Controller, Post, Body, Get, Param, Put, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MeetingService } from './meeting.service';

@Controller('meetings')
export class MeetingController {
    constructor(private readonly meetingService: MeetingService) { }

    // HTTP Endpoints
    @Post()
    async create(@Body() data: any) {
        return this.meetingService.createMeeting(data);
    }

    @Get(':id')
    async get(@Param('id') id: string) {
        return this.meetingService.getMeeting(id);
    }

    @Post(':id/join')
    async join(@Param('id') id: string, @Body('userId') userId: string) {
        return this.meetingService.joinMeeting(id, userId);
    }

    @Put(':id/start')
    async start(@Param('id') id: string, @Body('userId') userId: string) {
        return this.meetingService.startMeeting(id, userId);
    }

    @Put(':id/end')
    async end(@Param('id') id: string, @Body('userId') userId: string) {
        return this.meetingService.endMeeting(id, userId);
    }

    // gRPC Methods
    @GrpcMethod('MeetingService', 'CreateMeeting')
    async createMeeting(data: any) {
        const meeting = await this.meetingService.createMeeting(data);
        return {
            id: meeting.id,
            title: meeting.title,
            host_id: meeting.hostId,
            start_time: meeting.startTime.toISOString(),
            status: meeting.status,
        };
    }

    @GrpcMethod('MeetingService', 'GetMeeting')
    async getMeeting(data: { id: string }) {
        return this.meetingService.getMeeting(data.id);
    }
}
