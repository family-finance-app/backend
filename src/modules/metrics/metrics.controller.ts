import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { MetricsService } from './metrics.service.js';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Internal')
@Controller('metrics')
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  @ApiOperation({
    summary: 'Metrics collection (internal only)',
    description:
      'Internal endpoint for infrastructure monitoring. Blocked by nginx in production - returns 403 Forbidden. Only accessible from internal network/server.',
  })
  @ApiForbiddenResponse({
    description: '403 Forbidden - Restricted to internal server access only',
  })
  async getMetrics(@Res({ passthrough: true }) res: Response): Promise<string> {
    res.setHeader('Content-Type', this.metricsService.getContentType());
    return this.metricsService.getMetrics();
  }
}
