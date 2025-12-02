import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { MetricsService } from './metrics.service.js';

@Controller('metrics') // api/metrics
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  async getMetrics(@Res({ passthrough: true }) res: Response): Promise<string> {
    res.setHeader('Content-Type', this.metricsService.getContentType());
    return this.metricsService.getMetrics();
  }
}
