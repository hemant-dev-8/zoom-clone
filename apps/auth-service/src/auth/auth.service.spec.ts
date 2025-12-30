import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@zoom/shared';

describe('AuthService', () => {
    let service: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: {
                        findOne: jest.fn(),
                        findById: jest.fn(),
                        createGuest: jest.fn(),
                        create: jest.fn(),
                        bindDevice: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('mock-token'),
                    },
                },
                {
                    provide: PrismaService,
                    useValue: {
                        session: {
                            create: jest.fn(),
                            findUnique: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateUser', () => {
        it('should return user without password if credentials are valid', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                passwordHash: '$2a$10$mockHashedPassword',
                name: 'Test User',
                role: 'USER' as any,
                avatarUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

            // Mock bcrypt.compare to return true
            const bcrypt = require('bcryptjs');
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

            const result = await service.validateUser('test@example.com', 'password');

            expect(result).toBeDefined();
            expect(result.passwordHash).toBeUndefined();
            expect(result.email).toBe('test@example.com');
        });

        it('should return null if credentials are invalid', async () => {
            jest.spyOn(usersService, 'findOne').mockResolvedValue(null);

            const result = await service.validateUser('test@example.com', 'wrongpassword');

            expect(result).toBeNull();
        });
    });

    describe('login', () => {
        it('should return access and refresh tokens', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
                role: 'USER',
            };

            const result = await service.login(mockUser);

            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('refresh_token');
            expect(result).toHaveProperty('user');
            expect(jwtService.sign).toHaveBeenCalled();
            expect(prismaService.session.create).toHaveBeenCalled();
        });
    });
});
