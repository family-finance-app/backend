import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class TransactionsService {
  constructor(private database: DatabaseService) {}

  async findAll() {
    // TODO: Implement transactions logic
    return {
      message: 'Transactions module - to be implemented',
      transactions: [],
    };
  }
}
