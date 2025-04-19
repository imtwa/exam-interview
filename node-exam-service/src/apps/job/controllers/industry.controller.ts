import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IndustryService } from '../services/industry.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { success, pagination } from '../../../common/utils/response.util';
import { LoggerService } from '../../../common/logger/logger.service';
import { CreateIndustryCategoryDto } from '../dto/industry/create-industry-category.dto';
import { UpdateIndustryCategoryDto } from '../dto/industry/update-industry-category.dto';
import { CreateIndustrySubCategoryDto } from '../dto/industry/create-industry-subcategory.dto';
import { UpdateIndustrySubCategoryDto } from '../dto/industry/update-industry-subcategory.dto';

@Controller('industry')
export class IndustryController {
  private readonly logger: LoggerService;

  constructor(
    private readonly industryService: IndustryService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext(IndustryController.name);
  }

  /**
   * 获取所有行业分类（包括子分类）
   */
  @Get()
  async getAllCategories(
    @Query('includeSubcategories') includeSubcategories: string = 'true',
  ) {
    try {
      const include = includeSubcategories === 'true';
      const categories = await this.industryService.getAllCategories(include);
      return success(categories, '获取行业分类成功');
    } catch (error) {
      this.logger.error(`获取行业分类失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 获取单个行业分类详情
   */
  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    const categoryId = parseInt(id);
    try {
      const category = await this.industryService.getCategoryById(categoryId);
      return success(category, '获取行业分类详情成功');
    } catch (error) {
      this.logger.error(`获取行业分类详情失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 创建行业分类（需要管理员权限）
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createCategory(@Body() createCategoryDto: CreateIndustryCategoryDto) {
    try {
      const category =
        await this.industryService.createCategory(createCategoryDto);
      return success(category, '创建行业分类成功');
    } catch (error) {
      this.logger.error(`创建行业分类失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 更新行业分类（需要管理员权限）
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateIndustryCategoryDto,
  ) {
    const categoryId = parseInt(id);
    try {
      const category = await this.industryService.updateCategory(
        categoryId,
        updateCategoryDto,
      );
      return success(category, '更新行业分类成功');
    } catch (error) {
      this.logger.error(`更新行业分类失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 删除行业分类（需要管理员权限）
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    const categoryId = parseInt(id);
    try {
      await this.industryService.deleteCategory(categoryId);
      return success(null, '删除行业分类成功');
    } catch (error) {
      this.logger.error(`删除行业分类失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 获取某个行业分类下的所有子分类
   */
  @Get(':id/subcategories')
  async getSubcategories(@Param('id') id: string) {
    const categoryId = parseInt(id);
    try {
      const subcategories =
        await this.industryService.getSubcategories(categoryId);
      return success(subcategories, '获取子分类成功');
    } catch (error) {
      this.logger.error(`获取子分类失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 创建子分类（需要管理员权限）
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/subcategories')
  async createSubcategory(
    @Param('id') id: string,
    @Body() createSubcategoryDto: CreateIndustrySubCategoryDto,
  ) {
    const categoryId = parseInt(id);
    try {
      const subcategory = await this.industryService.createSubcategory(
        categoryId,
        createSubcategoryDto,
      );
      return success(subcategory, '创建子分类成功');
    } catch (error) {
      this.logger.error(`创建子分类失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 更新子分类（需要管理员权限）
   */
  @UseGuards(JwtAuthGuard)
  @Put('subcategories/:id')
  async updateSubcategory(
    @Param('id') id: string,
    @Body() updateSubcategoryDto: UpdateIndustrySubCategoryDto,
  ) {
    const subcategoryId = parseInt(id);
    try {
      const subcategory = await this.industryService.updateSubcategory(
        subcategoryId,
        updateSubcategoryDto,
      );
      return success(subcategory, '更新子分类成功');
    } catch (error) {
      this.logger.error(`更新子分类失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 删除子分类（需要管理员权限）
   */
  @UseGuards(JwtAuthGuard)
  @Delete('subcategories/:id')
  async deleteSubcategory(@Param('id') id: string) {
    const subcategoryId = parseInt(id);
    try {
      await this.industryService.deleteSubcategory(subcategoryId);
      return success(null, '删除子分类成功');
    } catch (error) {
      this.logger.error(`删除子分类失败: ${error.message}`, error);
      throw error;
    }
  }
}
