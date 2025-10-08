import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class AccountsService {
  constructor(private database: DatabaseService) {}

  async findAll() {
    // TODO: Implement accounts logic
    return {
      message: 'Accounts module - to be implemented',
      accounts: [],
    };
  }
}
