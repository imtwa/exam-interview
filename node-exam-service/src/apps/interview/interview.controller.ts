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
import { InterviewService } from './interview.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { QueryInterviewDto } from './dto/query-interview.dto';
import { VerifyInvitationCodeDto } from './dto/verify-invitation-code.dto';
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

@ApiTags('interview')
@Controller('interview')
export class InterviewController {
  private readonly logger: LoggerService;

  constructor(
    private readonly interviewService: InterviewService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext(InterviewController.name);
  }

  @ApiOperation({ summary: '创建面试' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createInterviewDto: CreateInterviewDto, @Request() req) {
    this.logger.log(`创建面试: ${JSON.stringify(createInterviewDto)}`);
    const result = await this.interviewService.create(
      createInterviewDto,
      req.user.userId,
    );
    return success(result, '创建成功');
  }

  @ApiOperation({ summary: '分页获取面试列表' })
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
  @ApiResponse({ status: 200, description: '返回面试列表及分页信息' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('page')
  async findAll(@Query() query: QueryInterviewDto, @Request() req) {
    this.logger.log(`查询面试列表: 页码${query.page}, 每页${query.pageSize}`);
    const { interviews, total } = await this.interviewService.findAll(
      query,
      req.user.userId,
    );
    return pagination(interviews, total, query.page, query.pageSize);
  }

  @ApiOperation({ summary: '根据ID获取面试信息' })
  @ApiParam({ name: 'id', description: '面试ID', type: 'number' })
  @ApiResponse({ status: 200, description: '返回面试信息' })
  @ApiResponse({ status: 404, description: '面试不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    this.logger.log(`查询面试: ${id}`);
    const result = await this.interviewService.findOne(+id, req.user.userId);
    return success(result);
  }

  @ApiOperation({ summary: '更新面试信息' })
  @ApiParam({ name: 'id', description: '面试ID', type: 'number' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '面试不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateInterviewDto: UpdateInterviewDto,
    @Request() req,
  ) {
    this.logger.log(`更新面试: ${id}`);
    const result = await this.interviewService.update(
      +id,
      updateInterviewDto,
      req.user.userId,
    );
    return success(result, '更新成功');
  }

  @ApiOperation({ summary: '删除面试' })
  @ApiParam({ name: 'id', description: '面试ID', type: 'number' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '面试不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('delete/:id')
  async remove(@Param('id') id: string, @Request() req) {
    this.logger.log(`删除面试: ${id}`);
    await this.interviewService.remove(+id, req.user.userId);
    return success(null, '删除成功');
  }

  @Post('invitation/verify')
  @ApiOperation({ summary: '验证面试邀请码' })
  @ApiResponse({
    status: 200,
    description: '验证成功',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            interviewId: { type: 'number', example: 1 },
            title: { type: 'string', example: '前端开发工程师 - 一面面试' },
            scheduleTime: { type: 'string', example: '2024-03-20T10:00:00Z' },
            duration: { type: 'number', example: 60 },
            canStart: { type: 'boolean', example: true },
            job: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                title: { type: 'string', example: '前端开发工程师' },
              },
            },
            company: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: '示例公司' },
              },
            },
            interviewer: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                username: { type: 'string', example: '面试官' },
                email: { type: 'string', example: 'interviewer@example.com' },
              },
            },
            jobSeeker: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                username: { type: 'string', example: '求职者' },
                email: { type: 'string', example: 'jobseeker@example.com' },
              },
            },
          },
        },
        message: { type: 'string', example: 'success' },
      },
    },
  })
  async verifyInvitation(@Body() dto: VerifyInvitationCodeDto) {
    const result = await this.interviewService.verifyInvitation(dto);
    return success(result);
  }
}
