import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get()
  @ApiTags('App')
  @ApiOperation({ summary: 'API root endpoint' })
  @ApiOkResponse({ description: 'Returns basic API information' })
  getRoot() {
    return {
      name: 'Family Finance API',
      version: '1.0.0',
      status: 'running',
      docs: '/docs',
      healthcheck: '/health',
    };
  }
}
