import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InterviewerService } from './interviewer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateInterviewerDto } from './dto/create-interviewer.dto';
import { UpdateInterviewerProfileDto } from './dto/update-interviewer-profile.dto';
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
import { AssignExamDto } from './dto/assign-exam.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';

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
  @ApiQuery({
    name: 'jobId',
    description: '职位ID',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'keyword',
    description: '关键词(姓名/邮箱/学校)',
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
    const { page = 1, pageSize = 10, status, jobId, keyword } = query;

    this.logger.log(
      `获取用户${userId}收到的职位申请列表, status: ${status}, jobId: ${jobId}, keyword: ${keyword}`,
    );

    try {
      const { items, total } = await this.interviewerService.getApplications(
        userId,
        parseInt(page as string),
        parseInt(pageSize as string),
        status as string,
        jobId ? parseInt(jobId as string) : undefined,
        keyword as string,
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
        examId: {
          type: 'number',
          description: '笔试试卷ID (仅状态为WRITTEN_TEST时需要)',
          example: 1,
        },
        note: {
          type: 'string',
          description: '笔试说明 (仅状态为WRITTEN_TEST时有效)',
          example: '请在24小时内完成笔试',
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
  @Post('applications/:id/status')
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('feedback') feedback: string,
    @Body('examId') examId: number,
    @Body('note') note: string,
    @Req() req,
  ) {
    const userId = req.user.userId;
    const applicationId = parseInt(id);

    this.logger.log(
      `用户${userId}更新职位申请ID:${applicationId}状态为:${status}${examId ? ', 试卷ID:' + examId : ''}`,
    );

    try {
      const application = await this.interviewerService.updateApplicationStatus(
        applicationId,
        status,
        userId,
        feedback,
        examId,
        note,
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
  @ApiParam({ name: 'id', description: '职位申请ID', type: Number })
  @ApiBody({
    description: '面试安排数据',
    type: ScheduleInterviewDto,
  })
  @ApiResponse({ status: 200, description: '安排成功' })
  @ApiResponse({ status: 404, description: '申请不存在' })
  @ApiResponse({ status: 400, description: '参数错误或申请状态不正确' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('applications/:id/schedule')
  async scheduleInterview(
    @Param('id') id: string,
    @Body() interviewData: ScheduleInterviewDto,
    @Req() req,
  ) {
    const userId = req.user.userId;
    const applicationId = parseInt(id);

    this.logger.log(
      `用户${userId}为职位申请ID:${applicationId}安排面试，轮次:${interviewData.round}`,
    );

    try {
      const interview = await this.interviewerService.scheduleInterview(
        applicationId,
        userId,
        interviewData,
      );
      return success(interview, '安排面试成功');
    } catch (error) {
      this.logger.error(`安排面试失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 更新面试官资料（支持同时创建公司）
   */
  @ApiOperation({ summary: '更新面试官资料（支持同时创建公司）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBody({ type: UpdateInterviewerProfileDto })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('profile/setup')
  async updateProfile(
    @Body() profileDto: UpdateInterviewerProfileDto,
    @Req() req,
  ) {
    const userId = req.user.userId;

    // 打印输入参数用于调试
    this.logger.log(
      `用户${userId}更新面试官资料，profileDto: ${JSON.stringify(profileDto)}`,
    );

    // 手动处理公司ID验证问题
    try {
      // 如果指定了使用现有公司但没有提供ID
      if (profileDto.useExistingCompany && !profileDto.existingCompanyId) {
        this.logger.log(
          '用户选择了使用现有公司但未提供公司ID，将其设置为不使用现有公司',
        );
        profileDto.useExistingCompany = false;
      }

      // 如果面试官信息中包含了可能为null的companyId，移除它
      if (
        profileDto.interviewer &&
        (profileDto.interviewer.companyId === null ||
          profileDto.interviewer.companyId === undefined)
      ) {
        this.logger.log('检测到无效的companyId，从请求中移除');
        delete profileDto.interviewer.companyId;
      }

      // 调用服务方法处理更新
      const result = await this.interviewerService.updateInterviewerProfile(
        userId,
        profileDto,
      );
      return success(result, '更新面试官资料成功');
    } catch (error) {
      // 详细记录错误信息
      this.logger.error(`更新面试官资料失败: ${error.message}`, error.stack);

      // 自定义错误响应
      if (error.message.includes('公司ID')) {
        return {
          code: 400,
          data: null,
          message: '更新失败：公司ID不能为空，请选择一个公司或创建新公司',
        };
      }

      // 抛出其他错误
      throw error;
    }
  }

  /**
   * 分配笔试试卷给求职者
   */
  @ApiOperation({ summary: '分配笔试试卷给求职者' })
  @ApiResponse({ status: 200, description: '分配成功' })
  @ApiResponse({ status: 400, description: '参数错误或试卷已分配' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权限操作该申请' })
  @ApiResponse({ status: 404, description: '申请或试卷不存在' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('applications/assign-exam')
  async assignExam(@Body() assignExamDto: AssignExamDto, @Req() req) {
    const userId = req.user.userId;
    this.logger.log(
      `为应聘申请${assignExamDto.applicationId}分配笔试, 用户ID: ${userId}`,
    );

    try {
      const result = await this.interviewerService.assignExamToCandidate(
        userId,
        assignExamDto,
      );

      return success(result, '分配笔试成功');
    } catch (error) {
      this.logger.error(`分配笔试失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 获取面试官管理的考试列表
   */
  @ApiOperation({ summary: '获取面试官管理的考试列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('exams')
  async getInterviewerExams(@Body() queryDto: any, @Req() req) {
    const userId = req.user.userId;
    this.logger.log(`获取面试官 ${userId} 管理的考试列表`);

    try {
      const result = await this.interviewerService.getInterviewerExams(
        userId,
        queryDto,
      );
      return success(result, '获取考试列表成功');
    } catch (error) {
      this.logger.error(`获取考试列表失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 延长考试截止时间
   */
  @ApiOperation({ summary: '延长考试截止时间' })
  @ApiResponse({ status: 200, description: '延长成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权操作此考试' })
  @ApiResponse({ status: 404, description: '考试不存在' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('exams/extend-deadline')
  async extendExamDeadline(@Body() data: any, @Req() req) {
    const userId = req.user.userId;
    const { examAssignmentId, newEndTime } = data;

    this.logger.log(
      `面试官 ${userId} 延长考试 ${examAssignmentId} 截止时间至 ${newEndTime}`,
    );

    try {
      const result = await this.interviewerService.extendExamDeadline(
        userId,
        examAssignmentId,
        new Date(newEndTime),
      );
      return success(result, '延长截止时间成功');
    } catch (error) {
      this.logger.error(`延长截止时间失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 发送考试提醒邮件
   */
  @ApiOperation({ summary: '发送考试提醒邮件' })
  @ApiResponse({ status: 200, description: '发送成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权操作此考试' })
  @ApiResponse({ status: 404, description: '考试不存在' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('exams/send-reminder')
  async sendExamReminder(@Body() data: any, @Req() req) {
    const userId = req.user.userId;
    const { examAssignmentId } = data;

    this.logger.log(`面试官 ${userId} 发送考试 ${examAssignmentId} 提醒邮件`);

    try {
      const result = await this.interviewerService.sendExamReminder(
        userId,
        examAssignmentId,
      );
      return success(result, '提醒邮件发送成功');
    } catch (error) {
      this.logger.error(`发送提醒邮件失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 取消考试
   */
  @ApiOperation({ summary: '取消考试' })
  @ApiResponse({ status: 200, description: '取消成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权操作此考试' })
  @ApiResponse({ status: 404, description: '考试不存在' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('exams/cancel')
  async cancelExam(@Body() data: any, @Req() req) {
    const userId = req.user.userId;
    const { examAssignmentId } = data;

    this.logger.log(`面试官 ${userId} 取消考试 ${examAssignmentId}`);

    try {
      const result = await this.interviewerService.cancelExam(
        userId,
        examAssignmentId,
      );
      return success(result, '取消考试成功');
    } catch (error) {
      this.logger.error(`取消考试失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 提交面试评价
   */
  @ApiOperation({ summary: '提交面试评价' })
  @ApiParam({ name: 'id', description: '面试ID', type: Number })
  @ApiResponse({ status: 200, description: '评价成功' })
  @ApiResponse({ status: 404, description: '面试不存在' })
  @ApiResponse({ status: 403, description: '无权操作此面试' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('interviews/:id/feedback')
  async submitInterviewFeedback(
    @Param('id') id: string,
    @Body() feedbackData: any,
    @Req() req,
  ) {
    const userId = req.user.userId;
    const interviewId = parseInt(id);

    this.logger.log(`用户${userId}提交面试ID:${interviewId}的评价`);

    try {
      const result = await this.interviewerService.submitInterviewFeedback(
        interviewId,
        userId,
        feedbackData,
      );
      return success(result, '提交面试评价成功');
    } catch (error) {
      this.logger.error(`提交面试评价失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 获取面试详情
   */
  @ApiOperation({ summary: '获取面试详情' })
  @ApiParam({ name: 'id', description: '面试ID', type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '面试不存在' })
  @ApiResponse({ status: 403, description: '无权查看此面试' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('interviews/:id')
  async getInterviewDetail(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId;
    const interviewId = parseInt(id);

    this.logger.log(`用户${userId}查看面试ID:${interviewId}的详情`);

    try {
      const result = await this.interviewerService.getInterviewDetail(
        interviewId,
        userId,
      );
      return success(result, '获取面试详情成功');
    } catch (error) {
      this.logger.error(`获取面试详情失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 验证面试邀请码
   */
  @ApiOperation({ summary: '验证面试邀请码' })
  @ApiParam({ name: 'code', description: '面试邀请码', type: String })
  @ApiResponse({ status: 200, description: '验证成功' })
  @ApiResponse({ status: 404, description: '邀请码无效' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('interviews/verify/:code')
  async verifyInterviewInvitation(@Param('code') code: string, @Req() req) {
    const userId = req.user.userId;

    this.logger.log(`用户${userId}验证面试邀请码:${code}`);

    try {
      const result = await this.interviewerService.verifyInterviewInvitation(
        code,
        userId,
      );
      return success(result, '验证面试邀请码成功');
    } catch (error) {
      this.logger.error(`验证面试邀请码失败: ${error.message}`, error);
      throw error;
    }
  }
}
