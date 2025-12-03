import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from '@songkeys/nestjs-redis-health';
import Redis from 'ioredis';
import { DatabaseService } from '../../database/database.service.js';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Internal')
@Controller()
export class HealthController {
  private readonly redis: Redis;

  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly db: DatabaseService,
    private readonly redisHealth: RedisHealthIndicator
  ) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check (internal only)',
    description:
      'Internal endpoint for infrastructure monitoring. Blocked by nginx in production - returns 403 Forbidden. Only accessible from internal network/server.',
  })
  @ApiForbiddenResponse({
    description: '403 Forbidden - Restricted to internal server access only',
  })
  @HealthCheck()
  async healthChecks(): Promise<HealthCheckResult> {
    return await this.health.check([
      () => this.prismaHealth.pingCheck('database', this.db, { timeout: 500 }),
      () =>
        this.redisHealth.checkHealth('redis', {
          type: 'redis',
          client: this.redis,
          timeout: 500,
        }),
    ]);
  }
}
