import { Module } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service.js';
import { CurrencyController } from './currency.controller.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [CurrencyController],
  providers: [ExchangeRateService],
  exports: [ExchangeRateService],
})
export class CurrencyModule {}
