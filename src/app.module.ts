import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AccountsModule } from './modules/accounts/accounts.module.js';
import { TransactionsModule } from './modules/transactions/transactions.module.js';
import { DatabaseModule } from './database/database.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { UserModule } from './modules/user/user.module.js';
import { MetricsModule } from './modules/metrics/metrics.module.js';
import { TerminusModule } from '@nestjs/terminus';
import { RedisHealthModule } from '@songkeys/nestjs-redis-health';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    AccountsModule,
    TransactionsModule,
    CategoriesModule,
    UserModule,
    MetricsModule,
    TerminusModule,
    RedisHealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
