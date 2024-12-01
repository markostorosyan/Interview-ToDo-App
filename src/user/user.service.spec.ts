import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('find user by email success', async () => {
    const mockUser = {id: 1, email: 'test@gmail.com', password: 'password123'};
    prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser); //?

    const result = await service.findByEmail(mockUser.email);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: mockUser.email }});

    expect(result).toEqual(mockUser);
  });
});
