import { Module } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service.js';
import { CurrencyController } from './currency.controller.js';

@Module({
  imports: [],
  controllers: [CurrencyController],
  providers: [ExchangeRateService],
  exports: [ExchangeRateService],
})
export class CurrencyModule {}
