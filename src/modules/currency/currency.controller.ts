import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ExchangeRateService } from './exchange-rate.service.js';

@ApiTags('currency')
@Controller('currency')
export class CurrencyController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get()
  @ApiOperation({ summary: 'Get exchange rates' })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async getRates() {
    return this.exchangeRateService.getRates();
  }
}
