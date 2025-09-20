// src/ratings/dto/index.ts
import { IsInt, Min, Max, IsString, IsOptional } from 'class-validator';

export class CreateRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  score: number;

  @IsOptional()
  @IsString()
  comment?: string;
}