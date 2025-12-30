import { Module } from '@nestjs/common';
import { RecorderService } from './recorder.service';
import { RecorderController } from './recorder.controller';

@Module({
    controllers: [RecorderController],
    providers: [RecorderService],
})
export class RecorderModule { }
