import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IndustryService } from './industry.service';
import { CreateIndustryCategoryDto } from './dto/create-industry-category.dto';
import { UpdateIndustryCategoryDto } from './dto/update-industry-category.dto';
import { CreateIndustrySubCategoryDto } from './dto/create-industry-subcategory.dto';
import { UpdateIndustrySubCategoryDto } from './dto/update-industry-subcategory.dto';
import { QueryIndustryDto } from './dto/query-industry.dto';
import { success, pagination } from '../../common/utils/response.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoggerService } from '../../common/logger/logger.service';

@ApiTags('industry')
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

  // 一级分类相关接口
  @ApiOperation({ summary: '创建行业一级分类' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('category')
  async createCategory(@Body() createCategoryDto: CreateIndustryCategoryDto) {
    this.logger.log(`创建行业分类: ${createCategoryDto.name}`);
    const result = await this.industryService.createCategory(createCategoryDto);
    return success(result, '创建成功');
  }

  @ApiOperation({ summary: '获取行业一级分类列表' })
  @ApiQuery({
    name: 'page',
    description: '当前页码',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页条数',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'keyword',
    description: '关键词搜索',
    required: false,
    type: String,
  })
  @ApiResponse({ status: 200, description: '返回分类列表及分页信息' })
  @Get('category')
  async findAllCategories(@Query() query: QueryIndustryDto) {
    this.logger.log(
      `查询行业分类列表: 页码${query.page}, 每页${query.pageSize}`,
    );
    const { categories, total } =
      await this.industryService.findAllCategories(query);
    return pagination(categories, total, query.page, query.pageSize);
  }

  @ApiOperation({ summary: '获取行业一级分类详情' })
  @ApiParam({ name: 'id', description: '分类ID', type: Number })
  @ApiResponse({ status: 200, description: '返回分类详情' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @Get('category/:id')
  async findOneCategory(@Param('id') id: string) {
    this.logger.log(`查询行业分类: ${id}`);
    const result = await this.industryService.findOneCategory(+id);
    return success(result);
  }

  @ApiOperation({ summary: '更新行业一级分类' })
  @ApiParam({ name: 'id', description: '分类ID', type: Number })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Patch('category/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateIndustryCategoryDto,
  ) {
    this.logger.log(`更新行业分类: ${id}`);
    const result = await this.industryService.updateCategory(
      +id,
      updateCategoryDto,
    );
    return success(result, '更新成功');
  }

  @ApiOperation({ summary: '删除行业一级分类' })
  @ApiParam({ name: 'id', description: '分类ID', type: Number })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @ApiResponse({ status: 400, description: '分类下存在二级分类，无法删除' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Delete('category/:id')
  async removeCategory(@Param('id') id: string) {
    this.logger.log(`删除行业分类: ${id}`);
    await this.industryService.removeCategory(+id);
    return success(null, '删除成功');
  }

  // 二级分类相关接口
  @ApiOperation({ summary: '创建行业二级分类' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 404, description: '一级分类不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('subcategory')
  async createSubCategory(
    @Body() createSubCategoryDto: CreateIndustrySubCategoryDto,
  ) {
    this.logger.log(`创建行业二级分类: ${createSubCategoryDto.name}`);
    const result =
      await this.industryService.createSubCategory(createSubCategoryDto);
    return success(result, '创建成功');
  }

  @ApiOperation({ summary: '获取行业二级分类列表' })
  @ApiParam({ name: 'categoryId', description: '一级分类ID', type: Number })
  @ApiResponse({ status: 200, description: '返回二级分类列表' })
  @ApiResponse({ status: 404, description: '一级分类不存在' })
  @Get('category/:categoryId/subcategories')
  async findSubCategories(@Param('categoryId') categoryId: string) {
    this.logger.log(`查询分类ID:${categoryId}下的二级分类列表`);
    const result = await this.industryService.findSubCategories(+categoryId);
    return success(result);
  }

  @ApiOperation({ summary: '获取单个行业二级分类详情' })
  @ApiParam({ name: 'id', description: '二级分类ID', type: Number })
  @ApiResponse({ status: 200, description: '返回二级分类详情' })
  @ApiResponse({ status: 404, description: '二级分类不存在' })
  @Get('subcategory/:id')
  async findOneSubCategory(@Param('id') id: string) {
    this.logger.log(`查询行业二级分类: ${id}`);
    const result = await this.industryService.findOneSubCategory(+id);
    return success(result);
  }

  @ApiOperation({ summary: '更新行业二级分类' })
  @ApiParam({ name: 'id', description: '二级分类ID', type: Number })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '二级分类不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Patch('subcategory/:id')
  async updateSubCategory(
    @Param('id') id: string,
    @Body() updateSubCategoryDto: UpdateIndustrySubCategoryDto,
  ) {
    this.logger.log(`更新行业二级分类: ${id}`);
    const result = await this.industryService.updateSubCategory(
      +id,
      updateSubCategoryDto,
    );
    return success(result, '更新成功');
  }

  @ApiOperation({ summary: '删除行业二级分类' })
  @ApiParam({ name: 'id', description: '二级分类ID', type: Number })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '二级分类不存在' })
  @ApiResponse({ status: 400, description: '二级分类下存在职位，无法删除' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Delete('subcategory/:id')
  async removeSubCategory(@Param('id') id: string) {
    this.logger.log(`删除行业二级分类: ${id}`);
    await this.industryService.removeSubCategory(+id);
    return success(null, '删除成功');
  }
}
