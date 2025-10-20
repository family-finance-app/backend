import { Controller, Get, HttpCode } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get('health')
  healthCheck(): any {
    return this.categoriesService.healthCheck();
  }

  @Get()
  getAllCategories(): any {
    return this.categoriesService.getAllCategories();
  }
}
