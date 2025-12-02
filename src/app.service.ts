import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'family-finance-backend',
    };
  }

  getInfo() {
    return {
      name: 'Family Finance Backend',
      version: '1.0.0',
      description: 'Monolithic backend API for Family Finance application',
      endpoints: {
        auth: '/auth',
        accounts: '/accounts',
        transactions: '/transactions',
      },
    };
  }
}
