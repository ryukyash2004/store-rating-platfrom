// src/admin/admin.controller.ts
import { Controller, Get, Post, Body, Query, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { CreateUserDto, CreateStoreDto, QueryUsersDto } from './dto';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Post('users')
  createUser(@Body() dto: CreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Post('stores')
  createStore(@Body() dto: CreateStoreDto) {
    return this.adminService.createStore(dto);
  }

  @Get('users')
  getUsers(@Query() query: QueryUsersDto) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserById(id);
  }

  @Get('stores')
  getStores(@Query() query: QueryUsersDto) {
    return this.adminService.getStores(query);
  }

  @Get('stores/:id')
  getStoreById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getStoreById(id);
  }
}