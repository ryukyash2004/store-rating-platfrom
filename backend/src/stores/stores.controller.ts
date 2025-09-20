// src/stores/stores.controller.ts
import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { StoresService } from './stores.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { GetUser } from '../users/decorators/get-user.decorator';
import { QueryStoresDto } from './dto';
import { User, Role } from '@prisma/client';

@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Get()
  findAll(@Query() query: QueryStoresDto) {
    return this.storesService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.storesService.findById(id, user.id);
  }

  @Get(':id/my-rating')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.USER)
  @UseGuards(RolesGuard)
  getUserRating(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.storesService.getUserRatingForStore(id, user.id);
  }
}