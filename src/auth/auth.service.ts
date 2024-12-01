import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { PayloadDto } from './dto/payload.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { AccessTokenDto } from './dto/access-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ){}

  async register(createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  async validateUser(loginDto: LoginDto): Promise<PayloadDto> {
    const user = await this.userService.findByEmail(loginDto.email)
    if (!user) {
      throw new NotFoundException('User not Found')
    }
    const isMatch = await bcrypt.compare(loginDto.password, user.password)
    if (!isMatch) {
      throw new BadRequestException('Wrong password');
    }
    return { id: user.id, email: user.email };
  }

  async login(loginDto: LoginDto): Promise<AccessTokenDto> {
    const payload = await this.validateUser(loginDto);

    return {
      access_token: await this.jwtService.signAsync(payload)
    };
  }
}
