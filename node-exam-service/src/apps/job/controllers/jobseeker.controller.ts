import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  UseGuards,
  Req,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { JobSeekerProfileDto } from '../dto/jobseeker-profile.dto';
import { JobSeekerService } from '../services/jobseeker.service';

/**
 * 求职者资料控制器
 *
 * 处理求职者资料的获取和更新
 */
@ApiTags('jobseeker')
@Controller('jobseeker')
export class JobSeekerController {
  private readonly logger = new Logger(JobSeekerController.name);

  constructor(private readonly jobSeekerService: JobSeekerService) {}

  /**
   * 获取求职者资料
   *
   * @example
   * GET /jobseeker/profile
   */
  @ApiOperation({
    summary: '获取求职者资料',
    description: '获取当前登录用户的求职者资料',
  })
  @ApiResponse({
    status: 200,
    description: '获取求职者资料成功',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取求职者资料成功' },
        data: {
          type: 'object',
          properties: {
            basic: { type: 'object' },
            education: { type: 'array', items: { type: 'object' } },
            workExperience: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '求职者资料不存在' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    const userId = req.user.userId;
    this.logger.log(`获取求职者资料，用户ID: ${userId}`);

    try {
      const profile = await this.jobSeekerService.getJobSeekerProfile(userId);

      return {
        code: 200,
        message: '获取求职者资料成功',
        data: profile,
      };
    } catch (error) {
      this.logger.error(`获取求职者资料失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 更新求职者资料
   *
   * @example
   * PUT /jobseeker/profile
   */
  @ApiOperation({
    summary: '更新求职者资料',
    description: '更新当前登录用户的求职者资料',
  })
  @ApiResponse({
    status: 200,
    description: '更新求职者资料成功',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '更新求职者资料成功' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求数据无效' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Req() req, @Body() profileDto: JobSeekerProfileDto) {
    const userId = req.user.userId;
    this.logger.log(`更新求职者资料，用户ID: ${userId}`);

    try {
      const updatedProfile = await this.jobSeekerService.updateJobSeekerProfile(
        userId,
        profileDto,
      );

      return {
        code: 200,
        message: '更新求职者资料成功',
        data: updatedProfile,
      };
    } catch (error) {
      this.logger.error(`更新求职者资料失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 创建求职者资料
   *
   * @example
   * POST /jobseeker/profile
   */
  @ApiOperation({
    summary: '创建求职者资料',
    description: '为当前登录用户创建求职者资料',
  })
  @ApiResponse({
    status: 201,
    description: '创建求职者资料成功',
    schema: {
      properties: {
        code: { type: 'number', example: 201 },
        message: { type: 'string', example: '创建求职者资料成功' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求数据无效' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async createProfile(@Req() req, @Body() profileDto: JobSeekerProfileDto) {
    const userId = req.user.userId;
    this.logger.log(`创建求职者资料，用户ID: ${userId}`);

    try {
      const createdProfile = await this.jobSeekerService.createJobSeekerProfile(
        userId,
        profileDto,
      );

      return {
        code: 201,
        message: '创建求职者资料成功',
        data: createdProfile,
      };
    } catch (error) {
      this.logger.error(`创建求职者资料失败: ${error.message}`);
      throw error;
    }
  }
}
