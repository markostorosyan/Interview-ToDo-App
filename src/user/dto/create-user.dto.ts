import { IsEmail, IsString, Length } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6,14)
  password: string;
}