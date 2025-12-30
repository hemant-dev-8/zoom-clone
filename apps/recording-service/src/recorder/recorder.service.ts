import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { join } from 'path';

@Injectable()
export class RecorderService {
    private activeRecordings = new Map<string, ffmpeg.FfmpegCommand>();

    startRecording(meetingId: string, audioStreamInput: any, videoStreamInput: any) {
        const outputPath = join(__dirname, `../../recordings/${meetingId}.mp4`);

        // Abstracted: In real world, we pipe RTP streams to ffmpeg via SDP
        // Here we show the FFmpeg command structure
        const command = ffmpeg()
            .input(videoStreamInput)
            .inputFormat('sdp')
            .input(audioStreamInput)
            .inputFormat('sdp')
            .outputOptions([
                '-c:v libx264',
                '-preset ultrafast',
                '-c:a aac'
            ])
            .save(outputPath)
            .on('end', () => console.log('Recording finished'))
            .on('error', (err) => console.error('Recording error', err));

        this.activeRecordings.set(meetingId, command);
        return { status: 'started', path: outputPath };
    }

    stopRecording(meetingId: string) {
        const command = this.activeRecordings.get(meetingId);
        if (command) {
            command.kill('SIGINT');
            this.activeRecordings.delete(meetingId);
            return { status: 'stopped' };
        }
        return { status: 'not_found' };
    }
}
