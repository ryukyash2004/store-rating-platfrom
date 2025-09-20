// src/stores/dto/index.ts
import { IsOptional, IsString, IsInt, Min, Max, IsEmail } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryStoresDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;
}

export class CreateStoreDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ownerId?: number;
}