// src/stores/stores.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryStoresDto } from './dto';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryStoresDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Max 100 items per page

    const whereCondition: any = {};
    
    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
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

  async findById(id: number, userId?: number) {
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
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // If userId provided, include user's rating for this store
    let userRating = null;
    if (userId) {
      userRating = await this.prisma.rating.findUnique({
        where: {
          userId_storeId: {
            userId,
            storeId: id,
          },
        },
        select: {
          id: true,
          score: true,
          comment: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    return {
      ...store,
      userRating,
    };
  }

  async getStoresByOwner(ownerId: number) {
    const stores = await this.prisma.store.findMany({
      where: { ownerId },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        avgRating: true,
        ratingCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return stores;
  }

  async getUserRatingForStore(storeId: number, userId: number) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const rating = await this.prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      select: {
        id: true,
        score: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return rating;
  }
}