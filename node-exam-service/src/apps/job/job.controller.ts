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
import { JobService } from './job.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { QueryJobDto } from './dto/query-job.dto';
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

@ApiTags('job')
@Controller('job')
export class JobController {
  private readonly logger: LoggerService;

  constructor(
    private readonly jobService: JobService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext(JobController.name);
  }

  @ApiOperation({ summary: '创建招聘信息' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createJobDto: CreateJobPostingDto, @Request() req) {
    this.logger.log(`创建招聘信息: ${createJobDto.title}`);
    const result = await this.jobService.create(createJobDto, req.user.userId);
    return success(result, '创建成功');
  }

  @ApiOperation({ summary: '获取分页招聘信息列表' })
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
  @ApiQuery({
    name: 'companyId',
    description: '公司ID',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'city',
    description: '城市',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'salaryMin',
    description: '薪资下限',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'salaryMax',
    description: '薪资上限',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'categoryId',
    description: '一级分类ID',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'subCategoryId',
    description: '二级分类ID',
    required: false,
    type: Number,
  })
  @ApiResponse({ status: 200, description: '返回招聘信息列表及分页信息' })
  @Get()
  async findAll(@Query() query: QueryJobDto) {
    this.logger.log(
      `查询招聘信息列表: 页码${query.page}, 每页${query.pageSize}`,
    );
    const { jobs, total } = await this.jobService.findAll(query);
    return pagination(jobs, total, query.page, query.pageSize);
  }

  @ApiOperation({ summary: '获取招聘信息详情' })
  @ApiParam({ name: 'id', description: '招聘信息ID', type: Number })
  @ApiResponse({ status: 200, description: '返回招聘信息详情' })
  @ApiResponse({ status: 404, description: '招聘信息不存在' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`查询招聘信息: ${id}`);
    const result = await this.jobService.findOne(+id);
    return success(result);
  }

  @ApiOperation({ summary: '更新招聘信息' })
  @ApiParam({ name: 'id', description: '招聘信息ID', type: Number })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '招聘信息不存在' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobPostingDto,
    @Request() req,
  ) {
    this.logger.log(`更新招聘信息: ${id}`);
    const result = await this.jobService.update(
      +id,
      updateJobDto,
      req.user.userId,
    );
    return success(result, '更新成功');
  }

  @ApiOperation({ summary: '删除招聘信息' })
  @ApiParam({ name: 'id', description: '招聘信息ID', type: Number })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '招聘信息不存在' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('delete/:id')
  async remove(@Param('id') id: string, @Request() req) {
    this.logger.log(`删除招聘信息: ${id}`);
    await this.jobService.remove(+id, req.user.userId);
    return success(null, '删除成功');
  }

  @ApiOperation({ summary: '获取热门城市列表' })
  @ApiResponse({ status: 200, description: '返回热门城市列表' })
  @Get('hot-cities')
  async getHotCities() {
    this.logger.log('获取热门城市列表');
    const result = await this.jobService.getHotCities();
    return success(result);
  }

  @ApiOperation({ summary: '获取面试官发布的职位列表' })
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
  @ApiResponse({ status: 200, description: '返回职位列表及分页信息' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '用户不是面试官' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('interviewer/jobs')
  async getInterviewerJobs(@Request() req, @Query() query) {
    const userId = req.user.userId;
    const { page = 1, pageSize = 10 } = query;

    this.logger.log(`获取面试官ID:${userId}发布的职位列表`);
    const { items, total } = await this.jobService.getInterviewerJobs(
      userId,
      parseInt(page as string),
      parseInt(pageSize as string),
    );

    return pagination(
      items,
      total,
      parseInt(page as string),
      parseInt(pageSize as string),
    );
  }
}
