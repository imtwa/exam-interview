import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InterviewerService } from './interviewer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateInterviewerDto } from './dto/create-interviewer.dto';
import { success, pagination } from '../../common/utils/response.util';
import { LoggerService } from '../../common/logger/logger.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('interviewer')
@Controller('interviewer')
export class InterviewerController {
  private readonly logger: LoggerService;

  constructor(
    private readonly interviewerService: InterviewerService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext(InterviewerController.name);
  }

  /**
   * 获取当前用户的面试官信息
   */
  @ApiOperation({ summary: '获取当前用户的面试官信息' })
  @ApiResponse({ status: 200, description: '返回面试官资料' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '面试官资料不存在' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    const userId = req.user.userId;
    this.logger.log(`获取用户${userId}的面试官信息`);

    try {
      const interviewer =
        await this.interviewerService.getInterviewerByUserId(userId);
      return success(interviewer, '获取面试官信息成功');
    } catch (error) {
      this.logger.error(`获取面试官信息失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 创建或更新面试官信息
   */
  @ApiOperation({ summary: '创建或更新面试官信息' })
  @ApiResponse({ status: 200, description: '创建/更新成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiQuery({
    name: 'companyId',
    description: '公司ID',
    required: true,
    type: Number,
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async createOrUpdateProfile(
    @Body() createInterviewerDto: CreateInterviewerDto,
    @Query('companyId') companyIdStr: string,
    @Req() req,
  ) {
    const userId = req.user.userId;
    const companyId = parseInt(companyIdStr);

    this.logger.log(
      `用户${userId}创建/更新面试官信息: ${JSON.stringify(createInterviewerDto)}`,
    );

    try {
      const interviewer =
        await this.interviewerService.createOrUpdateInterviewer(
          userId,
          companyId,
          createInterviewerDto,
        );
      return success(interviewer, '更新面试官信息成功');
    } catch (error) {
      this.logger.error(`创建/更新面试官信息失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 获取面试官创建的职位列表
   */
  @ApiOperation({ summary: '获取面试官创建的职位列表' })
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
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('jobs')
  async getInterviewerJobs(@Req() req, @Query() query) {
    const userId = req.user.userId;
    const { page = 1, pageSize = 10 } = query;

    this.logger.log(`获取用户${userId}创建的职位列表`);

    try {
      const { items, total } = await this.interviewerService.getInterviewerJobs(
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
    } catch (error) {
      this.logger.error(`获取面试官职位列表失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 获取面试官收到的职位申请列表
   */
  @ApiOperation({ summary: '获取面试官收到的职位申请列表' })
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
    name: 'status',
    description: '申请状态',
    required: false,
    type: String,
  })
  @ApiResponse({ status: 200, description: '返回申请列表及分页信息' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('applications')
  async getApplications(@Req() req, @Query() query) {
    const userId = req.user.userId;
    const { page = 1, pageSize = 10, status } = query;

    this.logger.log(`获取用户${userId}收到的职位申请列表, status: ${status}`);

    try {
      const { items, total } = await this.interviewerService.getApplications(
        userId,
        parseInt(page as string),
        parseInt(pageSize as string),
        status as string,
      );
      return pagination(
        items,
        total,
        parseInt(page as string),
        parseInt(pageSize as string),
      );
    } catch (error) {
      this.logger.error(`获取职位申请列表失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 更新职位申请状态 (进度推进、拒绝等)
   */
  @ApiOperation({ summary: '更新职位申请状态' })
  @ApiParam({ name: 'id', description: '申请ID', type: 'number' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: '申请新状态',
          example: 'accepted',
        },
        feedback: {
          type: 'string',
          description: '反馈信息',
          example: '您的简历非常符合我们的要求',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '申请不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Put('applications/:id/status')
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('feedback') feedback: string,
    @Req() req,
  ) {
    const userId = req.user.userId;
    const applicationId = parseInt(id);

    this.logger.log(
      `用户${userId}更新职位申请ID:${applicationId}状态为:${status}`,
    );

    try {
      const application = await this.interviewerService.updateApplicationStatus(
        applicationId,
        status,
        userId,
      );
      return success(application, '更新申请状态成功');
    } catch (error) {
      this.logger.error(`更新申请状态失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 安排面试
   */
  @ApiOperation({ summary: '安排面试' })
  @ApiParam({ name: 'id', description: '申请ID', type: 'number' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        scheduleTime: {
          type: 'string',
          description: '面试时间',
          example: '2023-05-20T14:00:00Z',
        },
        duration: {
          type: 'number',
          description: '面试时长（分钟）',
          example: 60,
        },
        meetingLink: {
          type: 'string',
          description: '会议链接',
          example: 'https://meeting.example.com/abc123',
        },
      },
      required: ['scheduleTime', 'duration'],
    },
  })
  @ApiResponse({ status: 200, description: '安排成功' })
  @ApiResponse({ status: 404, description: '申请不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('applications/:id/interview')
  async scheduleInterview(
    @Param('id') id: string,
    @Body()
    interviewData: {
      scheduleTime: string;
      duration: number;
      meetingLink?: string;
    },
    @Req() req,
  ) {
    const userId = req.user.userId;
    const applicationId = parseInt(id);

    this.logger.log(`用户${userId}为职位申请ID:${applicationId}安排面试`);

    try {
      const interview = await this.interviewerService.scheduleInterview(
        applicationId,
        userId,
        new Date(interviewData.scheduleTime),
        interviewData.duration,
        interviewData.meetingLink,
      );
      return success(interview, '安排面试成功');
    } catch (error) {
      this.logger.error(`安排面试失败: ${error.message}`, error);
      throw error;
    }
  }
}
