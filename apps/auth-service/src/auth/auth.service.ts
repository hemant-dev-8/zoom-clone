import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService, User } from '@zoom/shared';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private prisma: PrismaService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (user && await bcrypt.compare(pass, user.passwordHash)) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any, deviceId?: string) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        // Store refresh token
        await this.prisma.session.create({
            data: {
                userId: user.id,
                refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        if (deviceId) {
            await this.usersService.bindDevice(user.id, deviceId, 'web');
        }

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user,
        };
    }

    async guestLogin(name: string, deviceId: string) {
        const user = await this.usersService.createGuest(name);
        return this.login(user, deviceId);
    }

    async refreshToken(token: string) {
        const session = await this.prisma.session.findUnique({ where: { refreshToken: token } });
        if (!session || session.expiresAt < new Date()) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        const user = await this.usersService.findById(session.userId);
        if (!user) throw new UnauthorizedException('User not found');

        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: token,
        };
    }

    async register(data: any): Promise<User> {
        const { password, ...userData } = data;
        const hashedPassword = await bcrypt.hash(password, 10);
        return this.usersService.create({
            ...userData,
            passwordHash: hashedPassword,
        });
    }
}
