import { Controller, Post, Body, Param } from '@nestjs/common';
import { RecorderService } from './recorder.service';

@Controller('recordings')
export class RecorderController {
    constructor(private readonly recorderService: RecorderService) { }

    @Post('start')
    async start(@Body() body: { meetingId: string; audioData: any; videoData: any }) {
        // In real world, audioData/videoData contains RTP endpoint info or SDP
        return this.recorderService.startRecording(body.meetingId, body.audioData, body.videoData);
    }

    @Post(':id/stop')
    async stop(@Param('id') id: string) {
        return this.recorderService.stopRecording(id);
    }
}
