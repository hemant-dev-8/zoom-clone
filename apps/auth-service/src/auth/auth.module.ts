import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '@zoom/shared';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
            secret: 'secretKey', // In prod use env
            signOptions: { expiresIn: '60m' },
        }),
    ],
    providers: [AuthService, JwtStrategy, PrismaService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
