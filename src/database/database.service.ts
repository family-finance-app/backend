import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';

const { Pool } = pg;

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private pool: pg.Pool;

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

    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
    });

    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Connected to PostgreSQL database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
    console.log('Disconnected from PostgreSQL database');
  }
}
