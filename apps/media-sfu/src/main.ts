import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.useWebSocketAdapter(new IoAdapter(app));
    await app.listen(3004);
    console.log(`Media SFU running on port 3004`);
}
bootstrap();
