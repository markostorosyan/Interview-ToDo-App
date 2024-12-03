import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { AccessTokenDto } from './dto/access-token.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create user', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test@gmail.com',
      password: 'password123',
    };

    const mockUser: User = {
      id: 1,
      email: 'test@gmail.com',
      password: 'password123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(mockAuthService, 'register').mockReturnValue(mockUser);

    const result = await controller.register(createUserDto);

    expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
    expect(result).toEqual(mockUser);
  });

  it('should login user', async () => {
    const mockLoginDto: LoginDto = {
      email: 'test@gmail.com',
      password: 'password123',
    };
    const mockAccessToken: AccessTokenDto = {
      access_token: 'mockAccessToken',
    };

    jest.spyOn(mockAuthService, 'login').mockReturnValue(mockAccessToken);

    const result = await controller.login(mockLoginDto);

    expect(mockAuthService.login).toHaveBeenCalledWith(mockLoginDto);
    expect(result).toEqual(mockAccessToken);
  });
});
