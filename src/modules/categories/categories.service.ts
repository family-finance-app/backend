import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';

@Injectable()
export class CategoriesService {
  constructor(private database: DatabaseService) {}

  async getAllCategories(userId: number) {
    if (!userId || isNaN(userId))
      throw new BadRequestException('userId is required');
    try {
      const categories = await this.database.category.findMany({
        select: {
          id: true,
          name: true,
          type: true,
          icon: true,
          color: true,
        },
      });

      return {
        data: categories,
        status: 'success',
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(
        `Failed to fetch categories: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
