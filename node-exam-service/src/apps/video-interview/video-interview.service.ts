import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaClient } from '../../../prisma/generated/client';
import { LoggerService } from '../../common/logger/logger.service';
import { VerifyInvitationDto } from './dto/verify-invitation.dto';

@Injectable()
export class VideoInterviewService {
  constructor(
    @Inject('PRISMA_CLIENT')
    private prisma: PrismaClient,
    private logger: LoggerService,
  ) {}

  /**
   * 验证面试邀请码
   * @param dto 邀请码信息
   * @returns 面试信息
   */
  async verifyInvitation(dto: VerifyInvitationDto) {
    try {
      // 查找面试记录
      const interview = await this.prisma.interview.findUnique({
        where: {
          invitationCode: dto.invitationCode,
          deletedAt: null,
        },
        include: {
          jobSeeker: {
            include: {
              user: true,
            },
          },
          interviewer: {
            include: {
              user: true,
              company: true,
            },
          },
          application: {
            include: {
              job: true,
            },
          },
        },
      });

      if (!interview) {
        throw new NotFoundException('无效的邀请码');
      }

      // 检查面试状态
      if (interview.status !== 'SCHEDULED') {
        throw new BadRequestException('该面试已结束或已取消');
      }

      // 检查面试时间
      const now = new Date();
      const scheduleTime = new Date(interview.scheduleTime);
      const endTime = new Date(
        scheduleTime.getTime() + interview.duration * 60000,
      );

      // 如果当前时间在面试时间范围内
      const canStart = now >= scheduleTime && now <= endTime;

      return {
        interviewId: interview.id,
        title: `${interview.application.job.title} - ${interview.round}面试`,
        scheduleTime: interview.scheduleTime,
        duration: interview.duration,
        canStart,
        job: interview.application.job,
        company: interview.interviewer.company,
        interviewer: interview.interviewer.user,
        jobSeeker: interview.jobSeeker.user,
      };
    } catch (error) {
      this.logger.error('验证面试邀请码失败', error);
      throw error;
    }
  }
}
