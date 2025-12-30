import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaGateway } from './media.gateway';

@Module({
    providers: [MediaService, MediaGateway],
})
export class MediaModule { }
