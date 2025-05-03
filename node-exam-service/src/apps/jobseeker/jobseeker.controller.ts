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
import { JobSeekerService } from './jobseeker.service';
import { JobSeekerProfileDto } from './dto/jobseeker-profile.dto';
import { CreateEducationDto } from './dto/create-education.dto';
import { CreateWorkExperienceDto } from './dto/create-work-experience.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { UpdateWorkExperienceDto } from './dto/update-work-experience.dto';
import { QueryJobSeekerDto } from './dto/query-jobseeker.dto';
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
import { UpdateJobseekerProfileDto } from './dto/update-jobseeker-profile.dto';

@ApiTags('jobseeker')
@Controller('jobseeker')
export class JobSeekerController {
  private readonly logger: LoggerService;

  constructor(
    private readonly jobSeekerService: JobSeekerService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext('JobSeekerController');
  }

  @ApiOperation({ summary: '获取当前用户的求职者资料' })
  @ApiResponse({ status: 200, description: '返回求职者资料' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    this.logger.log(`获取用户${req.user.userId}的求职者资料`);
    const result = await this.jobSeekerService.getJobSeekerProfile(
      req.user.userId,
    );
    return success(result, '获取求职者资料成功');
  }

  @ApiOperation({ summary: '更新求职者基本资料' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('profile/update')
  async updateProfile(@Body() profileDto: JobSeekerProfileDto, @Request() req) {
    this.logger.log(`更新用户${req.user.userId}的求职者基本资料`);
    const result = await this.jobSeekerService.updateJobSeekerProfile(
      req.user.userId,
      profileDto,
    );
    return success(result, '更新求职者资料成功');
  }

  @ApiOperation({ summary: '一次性同步更新求职者完整资料' })
  @ApiResponse({ status: 200, description: '同步更新成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('profile/sync')
  async syncProfile(
    @Body() profileDto: UpdateJobseekerProfileDto,
    @Request() req,
  ) {
    this.logger.log(`同步更新用户${req.user.userId}的完整求职者资料`);
    const syncResult = await this.jobSeekerService.updateJobseekerProfile(
      req.user.userId,
      profileDto,
    );
    return success(syncResult, '同步更新求职者资料成功');
  }

  @ApiOperation({ summary: '分页获取求职者列表' })
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
  @ApiResponse({ status: 200, description: '返回求职者列表及分页信息' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('page')
  async findAll(@Query() query: QueryJobSeekerDto) {
    this.logger.log(`查询求职者列表: 页码${query.page}, 每页${query.pageSize}`);
    const { jobSeekers, total } = await this.jobSeekerService.findAll(query);
    return pagination(jobSeekers, total, query.page, query.pageSize);
  }

  @ApiOperation({ summary: '根据ID获取求职者信息' })
  @ApiParam({ name: 'id', description: '求职者ID', type: 'number' })
  @ApiResponse({ status: 200, description: '返回求职者信息' })
  @ApiResponse({ status: 404, description: '求职者不存在' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`查询求职者: ${id}`);
    const result = await this.jobSeekerService.findOne(+id);
    return success(result);
  }

  // 教育经历相关接口
  @ApiOperation({ summary: '添加教育经历' })
  @ApiResponse({ status: 201, description: '添加成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('education')
  async addEducation(
    @Body() createEducationDto: CreateEducationDto,
    @Request() req,
  ) {
    this.logger.log(`添加用户${req.user.userId}的教育经历`);
    const result = await this.jobSeekerService.addEducation(
      req.user.userId,
      createEducationDto,
    );
    return success(result, '添加教育经历成功');
  }

  @ApiOperation({ summary: '更新教育经历' })
  @ApiParam({ name: 'id', description: '教育经历ID', type: 'number' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '教育经历不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('education/update/:id')
  async updateEducation(
    @Param('id') id: string,
    @Body() updateEducationDto: UpdateEducationDto,
    @Request() req,
  ) {
    this.logger.log(`更新教育经历: ${id}`);
    const result = await this.jobSeekerService.updateEducation(
      +id,
      updateEducationDto,
      req.user.userId,
    );
    return success(result, '更新教育经历成功');
  }

  @ApiOperation({ summary: '删除教育经历' })
  @ApiParam({ name: 'id', description: '教育经历ID', type: 'number' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '教育经历不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('education/delete/:id')
  async removeEducation(@Param('id') id: string, @Request() req) {
    this.logger.log(`删除教育经历: ${id}`);
    await this.jobSeekerService.removeEducation(+id, req.user.userId);
    return success(null, '删除教育经历成功');
  }

  // 工作经验相关接口
  @ApiOperation({ summary: '添加工作经验' })
  @ApiResponse({ status: 201, description: '添加成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('work-experience')
  async addWorkExperience(
    @Body() createWorkExperienceDto: CreateWorkExperienceDto,
    @Request() req,
  ) {
    this.logger.log(`添加用户${req.user.userId}的工作经验`);
    const result = await this.jobSeekerService.addWorkExperience(
      req.user.userId,
      createWorkExperienceDto,
    );
    return success(result, '添加工作经验成功');
  }

  @ApiOperation({ summary: '更新工作经验' })
  @ApiParam({ name: 'id', description: '工作经验ID', type: 'number' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '工作经验不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('work-experience/update/:id')
  async updateWorkExperience(
    @Param('id') id: string,
    @Body() updateWorkExperienceDto: UpdateWorkExperienceDto,
    @Request() req,
  ) {
    this.logger.log(`更新工作经验: ${id}`);
    const result = await this.jobSeekerService.updateWorkExperience(
      +id,
      updateWorkExperienceDto,
      req.user.userId,
    );
    return success(result, '更新工作经验成功');
  }

  @ApiOperation({ summary: '删除工作经验' })
  @ApiParam({ name: 'id', description: '工作经验ID', type: 'number' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '工作经验不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('work-experience/delete/:id')
  async removeWorkExperience(@Param('id') id: string, @Request() req) {
    this.logger.log(`删除工作经验: ${id}`);
    await this.jobSeekerService.removeWorkExperience(+id, req.user.userId);
    return success(null, '删除工作经验成功');
  }

  @ApiOperation({ summary: '获取求职者应用列表' })
  @ApiQuery({
    name: 'page',
    description: '当前页码',
    required: true,
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页条数',
    required: true,
    type: Number,
  })
  @ApiQuery({
    name: 'status',
    description: '应用状态',
    required: false,
    type: String,
  })
  @ApiResponse({ status: 200, description: '返回求职者应用列表及分页信息' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('applications')
  async getUserApplications(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('status') status: string,
    @Request() req,
  ) {
    this.logger.log(`获取用户${req.user.userId}的求职者应用列表`);
    const { items, total } = await this.jobSeekerService.getUserApplications(
      req.user.userId,
      parseInt(page),
      parseInt(pageSize),
      status,
    );
    return pagination(items, total, parseInt(page), parseInt(pageSize));
  }
}
