import { Controller, Get, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@ApiUnauthorizedResponse({
  description: 'Unauthorized - Invalid or missing JWT token',
})
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Returns all available transaction categories',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async getAllCategories(@CurrentUser() user: { sub: number; email: string }) {
    return this.categoriesService.getAllCategories();
  }
}
