import 'dotenv/config';
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
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
  private readonly logger = new Logger(DatabaseService.name);

  constructor() {
    const databaseUrl = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

    if (!databaseUrl) {
      throw new Error(`DATABASE_URL is not defined`);
    }

    const pool = new Pool({
      connectionString: databaseUrl,
      max: 10, // max num of connections
      min: 2, // min num of connections to keep alive
      idleTimeoutMillis: 30000, // close idle connections after 30s
      connectionTimeoutMillis: 10000, // timeout for new connections
      keepAlive: true, // keep connections alive (important for cloud DBs)
      keepAliveInitialDelayMillis: 10000, // start keepalive after 10s
    });

    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err.message);
    });

    const adapter = new PrismaPg(pool);

    super({
      adapter,
    });

    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to PostgreSQL database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
    this.logger.log('Disconnected from PostgreSQL database');
  }
}
