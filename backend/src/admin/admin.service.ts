// src/admin/admin.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, CreateStoreDto, QueryUsersDto } from './dto';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.store.count(),
      this.prisma.rating.count(),
    ]);

    return {
      totalUsers,
      totalStores,
      totalRatings,
    };
  }

  async createUser(dto: CreateUserDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Generate password if not provided
    const password = dto.password || this.generateRandomPassword();
    const hashedPassword = await argon2.hash(password);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        address: dto.address,
        password: hashedPassword,
        role: dto.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id, // This would be the admin's ID in a real scenario
        action: 'CREATE',
        entity: 'USER',
        entityId: user.id,
        details: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });

    return {
      user,
      temporaryPassword: dto.password ? undefined : password,
    };
  }

  async createStore(dto: CreateStoreDto) {
    // Verify owner exists if provided
    if (dto.ownerId) {
      const owner = await this.prisma.user.findUnique({
        where: { id: dto.ownerId },
      });

      if (!owner) {
        throw new NotFoundException('Store owner not found');
      }
    }

    const store = await this.prisma.store.create({
      data: {
        name: dto.name,
        email: dto.email,
        address: dto.address,
        ownerId: dto.ownerId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        avgRating: true,
        ratingCount: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: dto.ownerId || 0, // This would be the admin's ID in a real scenario
        action: 'CREATE',
        entity: 'STORE',
        entityId: store.id,
        details: {
          name: store.name,
          email: store.email,
          ownerId: store.owner?.id,
        },
      },
    });

    return store;
  }

  async getUsers(query: QueryUsersDto) {
    const { page = 1, limit = 10, search, role } = query;
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const whereCondition: any = {};
    
    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      whereCondition.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereCondition,
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              ratings: true,
              ownedStores: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: whereCondition }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        ratings: {
          select: {
            id: true,
            score: true,
            comment: true,
            createdAt: true,
            store: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10, // Latest 10 ratings
        },
        ownedStores: {
          select: {
            id: true,
            name: true,
            avgRating: true,
            ratingCount: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            ratings: true,
            ownedStores: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getStores(query: QueryUsersDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const whereCondition: any = {};
    
    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        where: whereCondition,
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          avgRating: true,
          ratingCount: true,
          createdAt: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.store.count({ where: whereCondition }),
    ]);

    return {
      stores,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getStoreById(id: number) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        avgRating: true,
        ratingCount: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ratings: {
          select: {
            id: true,
            score: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10, // Latest 10 ratings
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  private generateRandomPassword(): string {
    return randomBytes(8).toString('hex');
  }
}