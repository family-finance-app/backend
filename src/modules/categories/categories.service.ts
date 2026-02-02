import { Injectable, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import {
  ApiErrorException,
  ErrorCode,
} from '../../common/exceptions/api-error.exception.js';
import { buildSuccessResponse } from '../../common/utils/response.js';
import { handlePrismaError } from '../../common/utils/prisma-error.js';

@Injectable()
export class CategoriesService {
  constructor(private database: DatabaseService) {}

  async getAllCategories() {
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

      return buildSuccessResponse(
        categories,
        'Categories list',
        HttpStatus.OK,
        '/categories',
      );
    } catch (error) {
      if (error instanceof ApiErrorException) throw error;

      handlePrismaError(error, {
        notFoundCode: ErrorCode.CATEGORIES_NOT_FOUND,
        notFoundMessage: 'Categories not found',
        defaultMessage: 'Failed to fetch categories list',
      });
    }
  }
}
