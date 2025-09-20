// src/ratings/ratings.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRatingDto } from './dto';
import { Role } from '@prisma/client';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async createOrUpdateRating(storeId: number, userId: number, dto: CreateRatingDto) {
    // Check if store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Check if user owns this store (store owners can't rate their own stores)
    if (store.ownerId === userId) {
      throw new ForbiddenException('You cannot rate your own store');
    }

    return await this.prisma.$transaction(async (prisma) => {
      // Check if rating already exists
      const existingRating = await prisma.rating.findUnique({
        where: {
          userId_storeId: {
            userId,
            storeId,
          },
        },
      });

      let rating;
      let oldScore = 0;

      if (existingRating) {
        // Update existing rating
        oldScore = existingRating.score;
        rating = await prisma.rating.update({
          where: { id: existingRating.id },
          data: {
            score: dto.score,
            comment: dto.comment,
          },
          select: {
            id: true,
            score: true,
            comment: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        // Update store average rating
        const newAvg = store.ratingCount > 0 
          ? (store.avgRating * store.ratingCount - oldScore + dto.score) / store.ratingCount
          : dto.score;

        await prisma.store.update({
          where: { id: storeId },
          data: { avgRating: newAvg },
        });
      } else {
        // Create new rating
        rating = await prisma.rating.create({
          data: {
            score: dto.score,
            comment: dto.comment,
            userId,
            storeId,
          },
          select: {
            id: true,
            score: true,
            comment: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        // Update store rating count and average
        const newCount = store.ratingCount + 1;
        const newAvg = (store.avgRating * store.ratingCount + dto.score) / newCount;

        await prisma.store.update({
          where: { id: storeId },
          data: {
            ratingCount: newCount,
            avgRating: newAvg,
          },
        });
      }

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId,
          action: existingRating ? 'UPDATE' : 'CREATE',
          entity: 'RATING',
          entityId: rating.id,
          details: {
            storeId,
            score: dto.score,
            comment: dto.comment,
            oldScore: existingRating ? oldScore : null,
          },
        },
      });

      return rating;
    });
  }

  async getRatingsByStore(storeId: number, userId: number, userRole: Role) {
    // Check if store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
        ownerId: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Only store owners can view ratings for their stores
    if (userRole !== Role.ADMIN && store.ownerId !== userId) {
      throw new ForbiddenException('You can only view ratings for your own stores');
    }

    const ratings = await this.prisma.rating.findMany({
      where: { storeId },
      select: {
        id: true,
        score: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      store: {
        id: store.id,
        name: store.name,
      },
      ratings,
    };
  }

  async getStoreSummary(storeId: number, userId: number, userRole: Role) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
        avgRating: true,
        ratingCount: true,
        ownerId: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Only store owners can view summary for their stores
    if (userRole !== Role.ADMIN && store.ownerId !== userId) {
      throw new ForbiddenException('You can only view summary for your own stores');
    }

    return {
      store: {
        id: store.id,
        name: store.name,
      },
      avgRating: store.avgRating,
      ratingCount: store.ratingCount,
    };
  }
}