import { IsString } from "class-validator";

export class AccessTokenDto {
  @IsString()
  access_token: string
}