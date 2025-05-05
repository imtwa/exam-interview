import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VideoInterviewService } from './video-interview.service';
import { VerifyInvitationDto } from './dto/verify-invitation.dto';
import { success } from '../../common/utils/response.util';

@ApiTags('视频面试')
@Controller('video-interview')
export class VideoInterviewController {
  constructor(private readonly videoInterviewService: VideoInterviewService) {}

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
  async verifyInvitation(@Body() dto: VerifyInvitationDto) {
    const result = await this.videoInterviewService.verifyInvitation(dto);
    return success(result);
  }
}
