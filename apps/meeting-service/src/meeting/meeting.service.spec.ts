import { Test, TestingModule } from '@nestjs/testing';
import { MeetingService } from './meeting.service';
import { PrismaService } from '@zoom/shared';
import { MeetingStatus, ParticipantRole } from '@prisma/client';

describe('MeetingService', () => {
    let service: MeetingService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MeetingService,
                {
                    provide: PrismaService,
                    useValue: {
                        meeting: {
                            create: jest.fn(),
                            findUnique: jest.fn(),
                            update: jest.fn(),
                        },
                        participant: {
                            create: jest.fn(),
                            findFirst: jest.fn(),
                        },
                        user: {
                            findUnique: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<MeetingService>(MeetingService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createMeeting', () => {
        it('should create a new meeting', async () => {
            const mockMeeting = {
                id: '1',
                hostId: 'user-1',
                title: 'Test Meeting',
                startTime: new Date(),
                status: MeetingStatus.SCHEDULED,
                settings: {},
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(prismaService.meeting, 'create').mockResolvedValue(mockMeeting as any);

            const result = await service.createMeeting({
                host_id: 'user-1',
                title: 'Test Meeting',
                start_time: new Date().toISOString(),
            });

            expect(result).toBeDefined();
            expect(result.title).toBe('Test Meeting');
            expect(prismaService.meeting.create).toHaveBeenCalled();
        });
    });

    describe('getMeeting', () => {
        it('should return a meeting by id', async () => {
            const mockMeeting = {
                id: '1',
                hostId: 'user-1',
                title: 'Test Meeting',
                startTime: new Date(),
                status: MeetingStatus.ACTIVE,
                settings: {},
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(prismaService.meeting, 'findUnique').mockResolvedValue(mockMeeting as any);

            const result = await service.getMeeting('1');

            expect(result).toBeDefined();
            expect(result.id).toBe('1');
            expect(result.title).toBe('Test Meeting');
        });

        it('should throw NotFoundException if meeting not found', async () => {
            jest.spyOn(prismaService.meeting, 'findUnique').mockResolvedValue(null);

            await expect(service.getMeeting('non-existent')).rejects.toThrow('Meeting not found');
        });
    });
});
