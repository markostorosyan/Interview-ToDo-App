import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

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

  it('should give error when crete user', async () => {
    const mockUser = { email: 'test@gmail.com', password: 'password123' }
    prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser.email);

    await expect(service.create(mockUser)).rejects.toThrow(BadRequestException);
  })

  it('should find and return user by email', async () => {
    const mockUser = {id: 1, email: 'test@gmail.com', password: 'password123'};
    prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

    const result = await service.findByEmail(mockUser.email);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: mockUser.email }});

    expect(result).toEqual(mockUser);
  });

  it('should create user', async () => {
    const hashPassword = 'some_hash_password';
    const mockUser: User = {
      id: 1,
      email: 'test@gmail.com',
      password: hashPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockCreateUserDto: CreateUserDto = {
      email: 'test@gmail.com',
      password: 'password123',
    };

    prisma.user.findUnique = jest.fn().mockResolvedValue(null);
    prisma.user.create = jest.fn().mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashPassword)
    
    const result = await service.create(mockCreateUserDto);
    
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: mockCreateUserDto.email }});
    expect(bcrypt.hash).toHaveBeenCalledWith(mockCreateUserDto.password, 10);
    expect(prisma.user.create).toHaveBeenCalledWith({ data: {email: mockCreateUserDto.email, password: hashPassword } });
    expect(result).toEqual(mockUser);
  }); 
});
