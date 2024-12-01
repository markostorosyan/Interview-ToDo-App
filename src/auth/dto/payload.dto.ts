import { IsEmail, IsNumber } from "class-validator";

export class PayloadDto {
  @IsNumber()
  id: number;

  @IsEmail()
  email: string;
}