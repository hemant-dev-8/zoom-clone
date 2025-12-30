import { Injectable } from '@nestjs/common';
import { PrismaService } from '@zoom/shared';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async create(data: any) {
        return this.prisma.user.create({ data });
    }

    async createGuest(name: string) {
        return this.prisma.user.create({
            data: {
                email: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@zoom-clone.local`,
                name,
                passwordHash: '',
                role: 'USER',
            },
        });
    }

    async bindDevice(userId: string, deviceId: string, deviceType: string) {
        return this.prisma.device.upsert({
            where: { deviceId },
            update: { userId, lastSeen: new Date() },
            create: { userId, deviceId, type: deviceType },
        });
    }
}
