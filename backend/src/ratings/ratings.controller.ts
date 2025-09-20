// src/ratings/ratings.controller.ts
import { Controller, Post, Get, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { GetUser } from '../users/decorators/get-user.decorator';
import { CreateRatingDto } from './dto';
import { User, Role } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('stores/:storeId/ratings')
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Post()
  @Roles(Role.USER)
  @UseGuards(RolesGuard)
  createOrUpdateRating(
    @Param('storeId', ParseIntPipe) storeId: number,
    @GetUser() user: User,
    @Body() dto: CreateRatingDto,
  ) {
    return this.ratingsService.createOrUpdateRating(storeId, user.id, dto);
  }

  @Get()
  @Roles(Role.STORE_OWNER, Role.ADMIN)
  @UseGuards(RolesGuard)
  getRatingsByStore(
    @Param('storeId', ParseIntPipe) storeId: number,
    @GetUser() user: User,
  ) {
    return this.ratingsService.getRatingsByStore(storeId, user.id, user.role);
  }

  @Get('summary')
  @Roles(Role.STORE_OWNER, Role.ADMIN)
  @UseGuards(RolesGuard)
  getStoreSummary(
    @Param('storeId', ParseIntPipe) storeId: number,
    @GetUser() user: User,
  ) {
    return this.ratingsService.getStoreSummary(storeId, user.id, user.role);
  }
}