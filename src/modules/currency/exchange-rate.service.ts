import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { CurrencyType } from '@prisma/client';
import { buildSuccessResponse } from '../../common/utils/response.js';
import {
  ApiErrorException,
  ErrorCode,
} from '../../common/exceptions/api-error.exception.js';

type ExchangeRate = Record<CurrencyType, number>;

type CurrencyRateResponse = {
  currencyCodeA: number;
  currencyCodeB: number;
  date?: number;
  rateBuy?: number;
  rateSell?: number;
  rateCross?: number;
};

const DEFAULT_RATES: ExchangeRate = {
  UAH: 1,
  USD: 43,
  EUR: 50,
};

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);
  private readonly apiUrl =
    process.env.MONO_EXCHANGE_API_URL ||
    'https://api.monobank.ua/bank/currency';
  private readonly cacheTtlMs = 1000 * 60 * 60 * 2;

  private cachedRates: ExchangeRate | null = null;
  private cachedAt: number | null = null;

  async getRates() {
    const now = Date.now();
    if (
      this.cachedRates &&
      this.cachedAt &&
      now - this.cachedAt < this.cacheTtlMs
    ) {
      return buildSuccessResponse(
        {
          rates: this.cachedRates,
          fetchedAt: new Date(this.cachedAt).toISOString(),
        },
        `Exchange rates as of ${new Date(this.cachedAt).toISOString()}`,
        HttpStatus.OK,
        '/currency',
      );
    }

    try {
      const rates = await this.fetchExchangeRates(this.cachedRates);
      this.cachedRates = rates;
      this.cachedAt = now;
      return buildSuccessResponse(
        {
          rates: this.cachedRates,
          fetchedAt: new Date(this.cachedAt).toISOString(),
        },
        `Exchange rates as of ${new Date(this.cachedAt).toISOString()}`,
        HttpStatus.OK,
        '/currency',
      );
    } catch (error) {
      if (error instanceof ApiErrorException) throw error;

      const errMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to get rates: ${errMessage}`, errStack);

      throw new ApiErrorException(
        'Failed to fetch exchange rates. Please try again later.',
        ErrorCode.UNKNOWN_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async convertAmount(
    amount: number,
    from: CurrencyType,
    to: CurrencyType,
    rates?: ExchangeRate,
  ): Promise<number> {
    const actualRates = rates ?? this.cachedRates;

    if (!actualRates) {
      throw new ApiErrorException(
        'Exchange rates are not available',
        ErrorCode.DATABASE_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (from === to) return amount;

    const fromRate = actualRates[from];
    const toRate = actualRates[to];

    if (!fromRate || !toRate) {
      throw new ApiErrorException(
        'Unsupported currency',
        ErrorCode.INVALID_CURRENCY,
        HttpStatus.BAD_REQUEST,
      );
    }

    const amountInBase = amount * fromRate;
    const converted = amountInBase / toRate;

    return converted;
  }

  private async fetchExchangeRates(
    cachedRates: ExchangeRate | null,
  ): Promise<ExchangeRate> {
    try {
      const { data } = await axios.get<CurrencyRateResponse[]>(this.apiUrl);

      const rates: ExchangeRate = { ...DEFAULT_RATES };

      data.forEach((item) => {
        if (item.currencyCodeA === 840 && item.currencyCodeB === 980) {
          rates.USD = item.rateCross || item.rateSell || rates.USD;
        } else if (item.currencyCodeA === 978 && item.currencyCodeB === 980) {
          rates.EUR = item.rateCross || item.rateSell || rates.EUR;
        }
      });

      return rates;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch exchange rates: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      if (cachedRates) {
        this.logger.warn('Using cached exchange rates');
        return cachedRates;
      }

      this.logger.warn('Using fallback exchange rates (no cache available)');
      return DEFAULT_RATES;
    }
  }
}
