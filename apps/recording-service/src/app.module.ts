import { Module } from '@nestjs/common';
import { RecorderModule } from './recorder/recorder.module';

@Module({
    imports: [RecorderModule],
})
export class AppModule { }
