import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const databaseUrl =
      nodeEnv === 'production'
        ? process.env.DATABASE_URL_PROD || process.env.DATABASE_URL
        : process.env.DATABASE_URL_DEV || process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        `DATABASE_URL${
          nodeEnv === 'production' ? '_PROD' : '_DEV'
        } is not defined`
      );
    }

    const adapter = new PrismaPg({ connectionString: databaseUrl });

    super({
      adapter,
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Connected to PostgreSQL database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Disconnected from PostgreSQL database');
  }
}
