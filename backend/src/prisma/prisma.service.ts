// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Disconnected from database');
  }

  async cleanDb() {
    // Use for testing - clean database in reverse order of dependencies
    await this.$transaction([
      this.auditLog.deleteMany(),
      this.refreshToken.deleteMany(),
      this.rating.deleteMany(),
      this.store.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}