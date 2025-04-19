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
import { InterviewerService } from '../job/services/interviewer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateInterviewerDto } from '../job/dto/create-interviewer.dto';
import { success, pagination } from '../../common/utils/response.util';
import { LoggerService } from '../../common/logger/logger.service';

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
        feedback,
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
