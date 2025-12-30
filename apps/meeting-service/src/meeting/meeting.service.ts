import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@zoom/shared';
import { MeetingStatus, ParticipantRole, Meeting, Participant } from '@prisma/client';

@Injectable()
export class MeetingService {
    constructor(private prisma: PrismaService) { }

    async createMeeting(data: any): Promise<Meeting> {
        return this.prisma.meeting.create({
            data: {
                hostId: data.host_id,
                title: data.title,
                startTime: new Date(data.start_time),
                status: MeetingStatus.SCHEDULED,
                settings: {
                    waitingRoom: data.waiting_room || false,
                },
            },
            include: {
                host: {
                    select: { id: true, name: true, email: true },
                },
            } as any, // Cast for include mismatch if strict
        });
    }

    async getMeeting(id: string) {
        const meeting = await this.prisma.meeting.findUnique({
            where: { id },
        });
        if (!meeting) throw new NotFoundException('Meeting not found');

        return {
            id: meeting.id,
            title: meeting.title,
            host_id: meeting.hostId,
            start_time: meeting.startTime.toISOString(),
            status: meeting.status,
            settings: meeting.settings,
        };
    }

    async joinMeeting(meetingId: string, userId: string): Promise<Participant> {
        const meeting = await this.prisma.meeting.findUnique({
            where: { id: meetingId },
        });

        if (!meeting) throw new NotFoundException('Meeting not found');
        if (meeting.status === MeetingStatus.ENDED) throw new ForbiddenException('Meeting has ended');

        // Check if participant already exists
        const existing = await this.prisma.participant.findFirst({
            where: { meetingId, userId },
        });

        if (existing) return existing;

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const isHost = meeting.hostId === userId;

        // Auto-start meeting if host joins
        if (isHost && meeting.status === MeetingStatus.SCHEDULED) {
            await this.prisma.meeting.update({
                where: { id: meetingId },
                data: { status: MeetingStatus.ACTIVE },
            });
        }

        const settings = meeting.settings as any;
        // If waiting room is enabled and not host, maybe logic needed?
        // Usually signaling handles "waiting" state, but we record them as participants.

        return this.prisma.participant.create({
            data: {
                meetingId,
                userId,
                name: user?.name || 'Guest',
                role: isHost ? ParticipantRole.HOST : ParticipantRole.GUEST,
            },
        });
    }

    async startMeeting(id: string, userId: string): Promise<Meeting> {
        const meeting = await this.prisma.meeting.findUnique({ where: { id } });
        if (!meeting) throw new NotFoundException('Meeting not found');
        if (meeting.hostId !== userId) throw new ForbiddenException('Only host can start meeting');

        return this.prisma.meeting.update({
            where: { id },
            data: { status: MeetingStatus.ACTIVE },
        });
    }

    async endMeeting(id: string, userId: string): Promise<Meeting> {
        const meeting = await this.prisma.meeting.findUnique({ where: { id } });
        if (!meeting) throw new NotFoundException('Meeting not found');
        if (meeting.hostId !== userId) throw new ForbiddenException('Only host can end meeting');

        return this.prisma.meeting.update({
            where: { id },
            data: { status: MeetingStatus.ENDED },
        });
    }
}
