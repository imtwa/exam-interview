import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
  Logger,
  Req,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { QueryJobDto } from './dto/query-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

/**
 * 职位管理控制器
 *
 * 处理职位的创建、查询、更新和删除，以及用户资料检查
 */
@ApiTags('job')
@Controller('job')
export class JobController {
  private readonly logger = new Logger(JobController.name);

  constructor(private readonly jobService: JobService) {}

  /**
   * 获取职位列表
   *
   * @example
   * GET /job?page=1&pageSize=10&keyword=开发&city=北京
   */
  @ApiOperation({
    summary: '获取职位列表',
    description: '支持分页、关键词搜索和多种筛选条件',
  })
  @ApiQuery({
    name: 'page',
    description: '页码',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页数量',
    required: false,
    type: Number,
  })
  @ApiQuery({ name: 'keyword', description: '关键词', required: false })
  @ApiQuery({ name: 'city', description: '城市', required: false })
  @ApiQuery({
    name: 'companyId',
    description: '公司ID',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'subCategoryId',
    description: '行业子分类ID',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'salaryMin',
    description: '最低薪资',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'salaryMax',
    description: '最高薪资',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '返回职位列表及分页信息',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取职位列表成功' },
        data: {
          type: 'object',
          properties: {
            list: {
              type: 'array',
              items: {
                type: 'object',
                example: {
                  id: 1,
                  title: '前端开发工程师',
                  city: '北京',
                  salaryMin: 15000,
                  salaryMax: 25000,
                  company: { id: 1, name: '示例科技公司' },
                  subCategory: { id: 2, name: '前端开发' },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 100 },
                page: { type: 'number', example: 1 },
                pageSize: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 10 },
              },
            },
          },
        },
      },
    },
  })
  @Get()
  async getJobList(@Query() queryJobDto: QueryJobDto) {
    this.logger.log(`获取职位列表请求参数: ${JSON.stringify(queryJobDto)}`);

    try {
      const result = await this.jobService.getJobList(queryJobDto);

      this.logger.log(
        `获取职位列表成功，返回 ${result.pagination.total} 条记录`,
      );

      return {
        code: 200,
        message: '获取职位列表成功',
        data: result,
      };
    } catch (error) {
      this.logger.error(`获取职位列表失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取职位详情
   *
   * @example
   * GET /job/1
   */
  @ApiOperation({
    summary: '获取职位详情',
    description: '根据职位ID获取详细信息，包含公司和面试官信息',
  })
  @ApiParam({ name: 'id', description: '职位ID', type: Number })
  @ApiResponse({
    status: 200,
    description: '返回职位详情',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取职位详情成功' },
        data: {
          type: 'object',
          example: {
            id: 1,
            title: '前端开发工程师',
            description: '负责公司前端开发',
            requirements: '熟悉React、Vue等框架',
            city: '北京',
            salaryMin: 15000,
            salaryMax: 25000,
            company: {
              id: 1,
              name: '示例科技公司',
              industry: '互联网',
            },
            interviewer: {
              id: 1,
              position: 'HR经理',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '无效的职位ID' })
  @ApiResponse({ status: 404, description: '职位不存在' })
  @Get(':id')
  async getJobDetail(@Param('id') id: string) {
    const jobId = parseInt(id);
    if (isNaN(jobId)) {
      throw new BadRequestException('无效的职位ID');
    }

    this.logger.log(`获取职位详情，ID: ${jobId}`);

    try {
      const job = await this.jobService.getJobDetail(jobId);

      return {
        code: 200,
        message: '获取职位详情成功',
        data: job,
      };
    } catch (error) {
      this.logger.error(`获取职位详情失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 创建职位
   *
   * @example
   * POST /job
   * {
   *   "title": "前端开发工程师",
   *   "description": "负责公司前端开发",
   *   "requirements": "熟悉React、Vue等框架",
   *   "city": "北京",
   *   "salaryMin": 15000,
   *   "salaryMax": 25000,
   *   "companyId": 1,
   *   "interviewerId": 1,
   *   "subCategoryId": 2
   * }
   */
  @ApiOperation({
    summary: '创建职位',
    description: '需要登录权限，创建新的职位信息',
  })
  @ApiBody({
    type: CreateJobDto,
    description: '职位创建参数',
    examples: {
      前端开发: {
        value: {
          title: '前端开发工程师',
          description: '负责公司前端开发',
          requirements: '熟悉React、Vue等框架',
          city: '北京',
          salaryMin: 15000,
          salaryMax: 25000,
          companyId: 1,
          interviewerId: 1,
          subCategoryId: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '创建职位成功',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '创建职位成功' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '无效的请求数据' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post()
  async createJob(@Body() createJobDto: CreateJobDto) {
    this.logger.log(`创建职位请求: ${JSON.stringify(createJobDto)}`);

    try {
      const job = await this.jobService.createJob(createJobDto);

      return {
        code: 200,
        message: '创建职位成功',
        data: job,
      };
    } catch (error) {
      this.logger.error(`创建职位失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 更新职位
   *
   * @example
   * PUT /job/1
   * {
   *   "title": "资深前端开发工程师",
   *   "salaryMin": 20000,
   *   "salaryMax": 30000
   * }
   */
  @ApiOperation({
    summary: '更新职位',
    description: '需要登录权限，更新现有职位的信息',
  })
  @ApiParam({ name: 'id', description: '职位ID', type: Number })
  @ApiBody({
    type: UpdateJobDto,
    description: '职位更新参数',
    examples: {
      更新薪资: {
        value: {
          salaryMin: 20000,
          salaryMax: 30000,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '更新职位成功',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '更新职位成功' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '无效的请求数据' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '职位不存在' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateJob(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    const jobId = parseInt(id);
    if (isNaN(jobId)) {
      throw new BadRequestException('无效的职位ID');
    }

    this.logger.log(
      `更新职位，ID: ${jobId}, 数据: ${JSON.stringify(updateJobDto)}`,
    );

    try {
      const job = await this.jobService.updateJob(jobId, updateJobDto);

      return {
        code: 200,
        message: '更新职位成功',
        data: job,
      };
    } catch (error) {
      this.logger.error(`更新职位失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 删除职位
   *
   * @example
   * DELETE /job/1
   */
  @ApiOperation({
    summary: '删除职位',
    description: '需要登录权限，将职位标记为已删除（软删除）',
  })
  @ApiParam({ name: 'id', description: '职位ID', type: Number })
  @ApiResponse({
    status: 200,
    description: '删除职位成功',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '删除职位成功' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '无效的职位ID' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '职位不存在' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteJob(@Param('id') id: string) {
    const jobId = parseInt(id);
    if (isNaN(jobId)) {
      throw new BadRequestException('无效的职位ID');
    }

    this.logger.log(`删除职位，ID: ${jobId}`);

    try {
      await this.jobService.deleteJob(jobId);

      return {
        code: 200,
        message: '删除职位成功',
      };
    } catch (error) {
      this.logger.error(`删除职位失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 检查用户资料
   *
   * @example
   * GET /job/profile/check
   */
  @ApiOperation({
    summary: '检查用户资料',
    description: '检查当前登录用户的资料是否完善',
  })
  @ApiResponse({
    status: 200,
    description: '返回用户资料信息',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取用户资料成功' },
        data: {
          type: 'object',
          properties: {
            isProfileCompleted: { type: 'boolean', example: true },
            role: { type: 'string', example: 'INTERVIEWER' },
            isInterviewer: { type: 'boolean', example: true },
            interviewer: { type: 'object' },
            company: { type: 'object' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('profile/check')
  async checkUserProfile(@Req() req) {
    const userId = req.user.userId;
    this.logger.log(`检查用户资料，用户ID: ${userId}`);

    try {
      const result = await this.jobService.checkUserProfile(userId);

      return {
        code: 200,
        message: '获取用户资料成功',
        data: result,
      };
    } catch (error) {
      this.logger.error(`检查用户资料失败: ${error.message}`);
      throw error;
    }
  }
}
