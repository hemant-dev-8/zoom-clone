import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // gRPC
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: {
            package: 'meeting',
            protoPath: join(__dirname, '../../../packages/proto/src/meeting.proto'),
            url: 'localhost:5001',
        },
    });

    await app.startAllMicroservices();
    await app.listen(3002);
    console.log(`Meeting Service running on port 3002 (HTTP) and 5001 (gRPC)`);
}
bootstrap();
