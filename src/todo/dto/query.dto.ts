import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional, } from "class-validator";
import { OrderByEnum } from "../../../constants/orderBy.enum";

export class QueryDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  completed?: boolean;

  @IsOptional()
  @IsEnum(OrderByEnum)
  orderBy: OrderByEnum;
}