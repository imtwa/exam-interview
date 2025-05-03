import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { QueryCompanyDto } from './dto/query-company.dto';
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

@ApiTags('company')
@Controller('company')
export class CompanyController {
  private readonly logger: LoggerService;

  constructor(
    private readonly companyService: CompanyService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext(CompanyController.name);
  }

  @ApiOperation({ summary: '创建公司' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto, @Request() req) {
    this.logger.log(`创建公司: ${createCompanyDto.name}`);
    const result = await this.companyService.create(
      createCompanyDto,
      req.user.userId,
    );
    return success(result, '创建成功');
  }

  @ApiOperation({ summary: '分页获取公司列表' })
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
    name: 'name',
    description: '公司名称（支持模糊搜索）',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'industry',
    description: '行业',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'verificationStatus',
    description: '验证状态',
    required: false,
    type: String,
  })
  @ApiResponse({ status: 200, description: '返回公司列表及分页信息' })
  @Get('page')
  async findAll(@Query() query: QueryCompanyDto) {
    this.logger.log(
      `查询公司列表: 页码${query.page}, 每页${query.pageSize}${
        query.name ? ', 公司名称: ' + query.name : ''
      }`,
    );
    const { companies, total } = await this.companyService.findAll(query);
    return pagination(companies, total, query.page, query.pageSize);
  }

  @ApiOperation({ summary: '根据ID获取公司信息' })
  @ApiParam({ name: 'id', description: '公司ID', type: 'number' })
  @ApiResponse({ status: 200, description: '返回公司信息' })
  @ApiResponse({ status: 404, description: '公司不存在' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`查询公司: ${id}`);
    const result = await this.companyService.findOne(+id);
    return success(result);
  }

  @ApiOperation({ summary: '获取公司的HR/面试官列表' })
  @ApiParam({ name: 'id', description: '公司ID', type: 'number' })
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
  @ApiResponse({ status: 200, description: '返回公司的HR/面试官列表' })
  @ApiResponse({ status: 404, description: '公司不存在' })
  @Get(':id/interviewers')
  async findInterviewers(@Param('id') id: string, @Query() query) {
    const { page = 1, pageSize = 10 } = query;
    this.logger.log(`查询公司${id}的HR/面试官列表`);
    const { interviewers, total } = await this.companyService.findInterviewers(
      +id,
      +page,
      +pageSize,
    );
    return pagination(interviewers, total, +page, +pageSize);
  }

  @ApiOperation({ summary: '更新公司信息' })
  @ApiParam({ name: 'id', description: '公司ID', type: 'number' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '公司不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Request() req,
  ) {
    this.logger.log(`更新公司: ${id}`);
    const result = await this.companyService.update(
      +id,
      updateCompanyDto,
      req.user.userId,
    );
    return success(result, '更新成功');
  }

  @ApiOperation({ summary: '删除公司' })
  @ApiParam({ name: 'id', description: '公司ID', type: 'number' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '公司不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('delete/:id')
  async remove(@Param('id') id: string, @Request() req) {
    this.logger.log(`删除公司: ${id}`);
    await this.companyService.remove(+id, req.user.userId);
    return success(null, '删除成功');
  }

  @ApiOperation({ summary: '验证公司信息' })
  @ApiParam({ name: 'id', description: '公司ID', type: 'number' })
  @ApiResponse({ status: 200, description: '验证成功' })
  @ApiResponse({ status: 404, description: '公司不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('verify/:id')
  async verifyCompany(@Param('id') id: string, @Request() req) {
    this.logger.log(`验证公司: ${id}`);
    const result = await this.companyService.verifyCompany(
      +id,
      req.user.userId,
    );
    return success(result, '验证成功');
  }
}
