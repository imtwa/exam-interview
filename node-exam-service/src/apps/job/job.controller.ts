import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, BadRequestException, Logger, Req } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { QueryJobDto } from './dto/query-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateInterviewerDto } from './dto/create-interviewer.dto';
import { ProfileSetupDto } from './dto/profile-setup.dto';

@Controller('job')
export class JobController {
  private readonly logger = new Logger(JobController.name);

  constructor(
    private readonly jobService: JobService,
  ) {}

  // 获取职位列表
  @Get()
  async getJobList(@Query() queryJobDto: QueryJobDto) {
    this.logger.log(`获取职位列表请求参数: ${JSON.stringify(queryJobDto)}`);
    
    try {
      const result = await this.jobService.getJobList(queryJobDto);
      
      this.logger.log(`获取职位列表成功，返回 ${result.pagination.total} 条记录`);
      
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
   * 获取公司列表（支持搜索）
   */
  @Get('companies')
  async getCompanies(
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('industry') industry?: string
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize) : 10;
    
    this.logger.log(`获取公司列表请求: keyword=${keyword}, page=${pageNum}, pageSize=${pageSizeNum}, industry=${industry}`);
    
    try {
      const result = await this.jobService.getCompanies({
        keyword,
        page: pageNum,
        pageSize: pageSizeNum,
        industry
      });
      
      return {
        code: 200,
        message: '获取公司列表成功',
        data: result,
      };
    } catch (error) {
      this.logger.error(`获取公司列表失败: ${error.message}`);
      throw error;
    }
  }

  // 获取职位详情
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

  // 创建职位 (需要JWT验证)
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

  // 更新职位 (需要JWT验证)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateJob(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    const jobId = parseInt(id);
    if (isNaN(jobId)) {
      throw new BadRequestException('无效的职位ID');
    }
    
    this.logger.log(`更新职位请求，ID: ${jobId}, 数据: ${JSON.stringify(updateJobDto)}`);
    
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

  // 删除职位 (需要JWT验证)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteJob(@Param('id') id: string) {
    const jobId = parseInt(id);
    if (isNaN(jobId)) {
      throw new BadRequestException('无效的职位ID');
    }
    
    this.logger.log(`删除职位请求，ID: ${jobId}`);
    
    try {
      const result = await this.jobService.deleteJob(jobId);
      
      return {
        code: 200,
        message: '删除职位成功',
        data: result,
      };
    } catch (error) {
      this.logger.error(`删除职位失败: ${error.message}`);
      throw error;
    }
  }

  // HR个人信息和公司管理API
  
  /**
   * 检查HR用户的个人资料，判断是否需要完善信息
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile/check')
  async checkUserProfile(@Req() req) {
    const userId = req.user.userId;
    this.logger.log(`检查用户资料状态: ${userId}`);
    
    try {
      const result = await this.jobService.checkUserProfile(userId);
      
      return {
        code: 200,
        message: '获取用户资料状态成功',
        data: result,
      };
    } catch (error) {
      this.logger.error(`检查用户资料状态失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 设置HR个人资料和公司信息
   */
  @UseGuards(JwtAuthGuard)
  @Post('profile/setup')
  async setupProfile(@Body() profileSetupDto: ProfileSetupDto, @Req() req) {
    const userId = req.user.userId;
    this.logger.log(`设置用户资料: ${userId}`);
    
    try {
      const result = await this.jobService.setupProfile(userId, profileSetupDto);
      
      return {
        code: 200,
        message: '设置用户资料成功',
        data: result,
      };
    } catch (error) {
      this.logger.error(`设置用户资料失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 创建公司
   */
  @UseGuards(JwtAuthGuard)
  @Post('company')
  async createCompany(@Body() createCompanyDto: CreateCompanyDto, @Req() req) {
    this.logger.log(`创建公司请求: ${JSON.stringify(createCompanyDto)}`);
    const userId = req.user.userId;
    
    try {
      const company = await this.jobService.createCompany(createCompanyDto, userId);
      
      return {
        code: 200,
        message: '创建公司成功',
        data: company,
      };
    } catch (error) {
      this.logger.error(`创建公司失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取当前用户的公司信息
   */
  @UseGuards(JwtAuthGuard)
  @Get('company/mine')
  async getMyCompany(@Req() req) {
    const userId = req.user.userId;
    this.logger.log(`获取当前用户公司信息: ${userId}`);
    
    try {
      const company = await this.jobService.getCompanyByUserId(userId);
      
      return {
        code: 200,
        message: '获取公司信息成功',
        data: company,
      };
    } catch (error) {
      this.logger.error(`获取公司信息失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 更新公司信息
   */
  @UseGuards(JwtAuthGuard)
  @Put('company')
  async updateCompany(@Body() updateCompanyDto: CreateCompanyDto, @Req() req) {
    const userId = req.user.userId;
    this.logger.log(`更新公司信息请求: ${JSON.stringify(updateCompanyDto)}`);
    
    try {
      const company = await this.jobService.updateCompany(userId, updateCompanyDto);
      
      return {
        code: 200,
        message: '更新公司信息成功',
        data: company,
      };
    } catch (error) {
      this.logger.error(`更新公司信息失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 创建或更新面试官信息
   */
  @UseGuards(JwtAuthGuard)
  @Post('interviewer')
  async createOrUpdateInterviewer(
    @Body() createInterviewerDto: CreateInterviewerDto,
    @Query('companyId') companyIdStr: string,
    @Req() req,
  ) {
    const userId = req.user.userId;
    const companyId = parseInt(companyIdStr);
    
    if (isNaN(companyId)) {
      throw new BadRequestException('无效的公司ID');
    }
    
    this.logger.log(`创建/更新面试官信息: ${userId}, 公司ID: ${companyId}`);
    
    try {
      const interviewer = await this.jobService.createOrUpdateInterviewer(
        userId,
        createInterviewerDto,
        companyId,
      );
      
      return {
        code: 200,
        message: '设置面试官信息成功',
        data: interviewer,
      };
    } catch (error) {
      this.logger.error(`设置面试官信息失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取行业分类数据
   */
  @Get('industry-categories')
  async getIndustryCategories() {
    this.logger.log('获取行业分类数据');
    
    try {
      const categories = await this.jobService.getIndustryCategories();
      
      return {
        code: 200,
        message: '获取行业分类数据成功',
        data: categories,
      };
    } catch (error) {
      this.logger.error(`获取行业分类数据失败: ${error.message}`);
      throw error;
    }
  }
} 