import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { PayloadDto } from './dto/payload.dto';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenDto } from './dto/access-token.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should validate user', async () => {
    const mockLoginDto: LoginDto = {
      email: 'test@gmail.com',
      password: 'password123',
    };
    const mockUser: User = {
      id: 1,
      email: 'test@gmail.com',
      password: await bcrypt.hash('password123', 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockPayloadDto: PayloadDto = {
      id: mockUser.id,
      email: mockUser.email,
    };

    jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const result = await authService.validateUser(mockLoginDto);

    expect(userService.findByEmail).toHaveBeenCalledWith(mockLoginDto.email);
    expect(bcrypt.compare).toHaveBeenCalledWith(mockLoginDto.password, mockUser.password);

    expect(result).toEqual(mockPayloadDto);
  });

  it('should throw NotFoundException if user is not found', async () => {
    const mockLoginDto: LoginDto = {
      email: 'testUser@gmail.com',
      password: 'password123',
    };

    jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

    await expect(authService.validateUser(mockLoginDto)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if password is incorrect', async () => {
    const mockLoginDto: LoginDto = {
      email: 'testUser@gmail.com',
      password: 'password1234',
    };
    const mockUser: User = {
      id: 1,
      email: 'test@gmail.com',
      password: await bcrypt.hash('password123', 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    await expect(authService.validateUser(mockLoginDto)).rejects.toThrow(BadRequestException);
  });

  it('should login user', async () => {
    const mockLoginDto: LoginDto = {
      email: 'testUser@gmail.com',
      password: 'password1234',
    };
    const mockPayloadDto: PayloadDto = {
      id: 1,
      email: 'testUser@gmail.com',
    };
    const mockAccessToken: AccessTokenDto = {
      access_token: 'access_token',
    };

    jest.spyOn(authService, 'validateUser').mockResolvedValue(mockPayloadDto);
    (jwtService.signAsync as jest.Mock).mockResolvedValue(mockAccessToken.access_token);

    const result = await authService.login(mockLoginDto);

    expect(authService.validateUser).toHaveBeenCalledWith(mockLoginDto);
    expect(jwtService.signAsync).toHaveBeenCalledWith(mockPayloadDto);
    expect(result).toEqual(mockAccessToken);
  });
});
