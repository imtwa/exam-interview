import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  PrismaClient,
  InterviewStatus,
  JobApplicationStatus,
  InterviewRound,
} from '../../../prisma/generated/client';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { QueryInterviewDto } from './dto/query-interview.dto';
import { VerifyInvitationCodeDto } from './dto/verify-invitation-code.dto';
import { LoggerService } from '../../common/logger/logger.service';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class InterviewService {
  private readonly logger: LoggerService;

  constructor(
    @Inject('PRISMA_CLIENT')
    private prisma: PrismaClient,
    private loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext('InterviewService');
  }

  /**
   * 创建面试
   * @param createInterviewDto 创建面试DTO
   * @param userId 创建用户ID
   * @returns 创建的面试信息
   */
  async create(createInterviewDto: CreateInterviewDto, userId: number) {
    // 检查用户是否存在
    const user = await this.prisma.frontUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`创建面试失败，用户不存在: ${userId}`);
      throw new NotFoundException('用户不存在');
    }

    // 检查用户是否为面试官
    if (user.role !== UserRole.INTERVIEWER) {
      this.logger.warn(`创建面试失败，用户不是面试官: ${userId}`);
      throw new BadRequestException('只有面试官可以创建面试');
    }

    // 检查申请是否存在
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: createInterviewDto.applicationId },
      include: {
        job: {
          include: {
            interviewer: true,
          },
        },
      },
    });

    if (!application) {
      this.logger.warn(
        `创建面试失败，申请不存在: ${createInterviewDto.applicationId}`,
      );
      throw new NotFoundException('申请不存在');
    }

    // 检查面试官是否有权限操作该申请
    const interviewer = await this.prisma.interviewer.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
    });

    if (!interviewer || interviewer.id !== application.job.interviewer.id) {
      this.logger.warn(`创建面试失败，面试官无权操作该申请: ${userId}`);
      throw new ForbiddenException('您无权操作该申请');
    }

    try {
      // 创建面试
      const interview = await this.prisma.interview.create({
        data: {
          application: {
            connect: { id: createInterviewDto.applicationId },
          },
          jobSeeker: {
            connect: { id: application.jobSeekerId },
          },
          interviewer: {
            connect: { id: interviewer.id },
          },
          scheduleTime: createInterviewDto.scheduleTime,
          duration: createInterviewDto.duration,
          location: createInterviewDto.location,
          notes: createInterviewDto.notes,
          round: 'FIRST_INTERVIEW',
          status: InterviewStatus.SCHEDULED,
          type: 'VIDEO',
        },
      });

      // 更新申请状态
      await this.prisma.jobApplication.update({
        where: { id: createInterviewDto.applicationId },
        data: {
          status: JobApplicationStatus.FIRST_INTERVIEW,
        },
      });

      this.logger.log(`创建面试成功: ${interview.id}`);
      return interview;
    } catch (error) {
      this.logger.error(`创建面试失败: ${error.message}`, error.stack);
      throw new BadRequestException('创建面试失败');
    }
  }

  /**
   * 分页获取面试列表
   * @param query 查询参数
   * @param userId 用户ID
   * @param isAdmin 是否为管理员
   * @returns 面试列表及总数
   */
  async findAll(query: QueryInterviewDto, userId: number, isAdmin: boolean) {
    const { page = 1, pageSize = 10, status, startDate, endDate, id } = query;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    let where: any = {};

    // 如果是管理员，可以查看所有面试
    if (!isAdmin) {
      // 获取用户信息
      const user = await this.prisma.frontUser.findUnique({
        where: { id: userId },
      });

      if (!user) {
        this.logger.warn(`查询面试列表失败，用户不存在: ${userId}`);
        throw new NotFoundException('用户不存在');
      }

      // 根据用户角色构建不同的查询条件
      if (user.role === UserRole.INTERVIEWER) {
        // 面试官只能查看自己负责的职位的面试
        const interviewer = await this.prisma.interviewer.findFirst({
          where: {
            userId,
            deletedAt: null,
          },
        });

        if (!interviewer) {
          this.logger.warn(`查询面试列表失败，面试官信息不存在: ${userId}`);
          throw new NotFoundException('面试官信息不存在');
        }

        where = {
          interviewerId: interviewer.id,
        };
      } else if (user.role === UserRole.JOB_SEEKER) {
        // 求职者只能查看自己的面试
        const jobSeeker = await this.prisma.jobSeeker.findFirst({
          where: {
            userId,
            deletedAt: null,
          },
        });

        if (!jobSeeker) {
          this.logger.warn(`查询面试列表失败，求职者信息不存在: ${userId}`);
          throw new NotFoundException('求职者信息不存在');
        }

        where = {
          jobSeekerId: jobSeeker.id,
        };
      }
    }

    // 添加其他查询条件
    if (id) {
      where.id = id;
    }
    if (status) {
      where.status = status;
    }
    if (startDate) {
      where.scheduleTime = {
        ...where.scheduleTime,
        gte: new Date(startDate),
      };
    }
    if (endDate) {
      where.scheduleTime = {
        ...where.scheduleTime,
        lte: new Date(endDate),
      };
    }

    try {
      const [interviews, total] = await Promise.all([
        this.prisma.interview.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { scheduleTime: 'desc' },
          include: {
            jobSeeker: {
              include: {
                user: {
                  select: {
                    username: true,
                    email: true,
                  },
                },
              },
            },
            interviewer: {
              include: {
                user: {
                  select: {
                    username: true,
                    email: true,
                  },
                },
                company: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            application: {
              include: {
                job: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        }),
        this.prisma.interview.count({ where }),
      ]);

      this.logger.log(
        `查询面试列表成功: 页码${page}, 每页${pageSize}, 总数${total}`,
      );
      return { interviews, total };
    } catch (error) {
      this.logger.error(`查询面试列表失败: ${error.message}`, error.stack);
      throw new BadRequestException('查询面试列表失败');
    }
  }

  /**
   * 更新面试信息
   * @param id 面试ID
   * @param updateInterviewDto 更新面试DTO
   * @param userId 用户ID
   * @returns 更新后的面试信息
   */
  async update(
    id: number,
    updateInterviewDto: UpdateInterviewDto,
    userId: number,
  ) {
    // 获取用户信息
    const user = await this.prisma.frontUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`更新面试失败，用户不存在: ${userId}`);
      throw new NotFoundException('用户不存在');
    }

    // 检查用户是否为面试官
    if (user.role !== UserRole.INTERVIEWER) {
      this.logger.warn(`更新面试失败，用户不是面试官: ${userId}`);
      throw new BadRequestException('只有面试官可以更新面试');
    }

    // 查询面试信息
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            job: {
              include: {
                interviewer: true,
              },
            },
          },
        },
      },
    });

    if (!interview) {
      this.logger.warn(`更新面试失败，面试不存在: ${id}`);
      throw new NotFoundException('面试不存在');
    }

    // 检查面试官是否有权限操作该面试
    const interviewer = await this.prisma.interviewer.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
    });

    if (
      !interviewer ||
      interviewer.id !== interview.application.job.interviewer.id
    ) {
      this.logger.warn(`更新面试失败，面试官无权操作该面试: ${userId}`);
      throw new ForbiddenException('您无权操作该面试');
    }

    try {
      // 更新面试
      const updatedInterview = await this.prisma.interview.update({
        where: { id },
        data: updateInterviewDto,
      });

      // 如果更新了面试状态，同步更新申请状态
      if (updateInterviewDto.status) {
        const applicationStatus = this.mapInterviewStatusToApplicationStatus(
          updateInterviewDto.status,
        );
        await this.prisma.jobApplication.update({
          where: { id: interview.applicationId },
          data: {
            status: applicationStatus,
          },
        });
      }

      this.logger.log(`更新面试成功: ${id}`);
      return updatedInterview;
    } catch (error) {
      this.logger.error(`更新面试失败: ${error.message}`, error.stack);
      throw new BadRequestException('更新面试失败');
    }
  }

  /**
   * 删除面试
   * @param id 面试ID
   * @param userId 用户ID
   */
  async remove(id: number, userId: number) {
    // 获取用户信息
    const user = await this.prisma.frontUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`删除面试失败，用户不存在: ${userId}`);
      throw new NotFoundException('用户不存在');
    }

    // 检查用户是否为面试官
    if (user.role !== UserRole.INTERVIEWER) {
      this.logger.warn(`删除面试失败，用户不是面试官: ${userId}`);
      throw new BadRequestException('只有面试官可以删除面试');
    }

    // 查询面试信息
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            job: {
              include: {
                interviewer: true,
              },
            },
          },
        },
      },
    });

    if (!interview) {
      this.logger.warn(`删除面试失败，面试不存在: ${id}`);
      throw new NotFoundException('面试不存在');
    }

    // 检查面试官是否有权限操作该面试
    const interviewer = await this.prisma.interviewer.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
    });

    if (
      !interviewer ||
      interviewer.id !== interview.application.job.interviewer.id
    ) {
      this.logger.warn(`删除面试失败，面试官无权操作该面试: ${userId}`);
      throw new ForbiddenException('您无权操作该面试');
    }

    try {
      // 删除面试
      await this.prisma.interview.delete({
        where: { id },
      });

      // 更新申请状态为上一个状态
      await this.prisma.jobApplication.update({
        where: { id: interview.applicationId },
        data: {
          status: JobApplicationStatus.RESUME_SCREENING, // 默认回到简历筛选状态
        },
      });

      this.logger.log(`删除面试成功: ${id}`);
    } catch (error) {
      this.logger.error(`删除面试失败: ${error.message}`, error.stack);
      throw new BadRequestException('删除面试失败');
    }
  }

  /**
   * 将面试状态映射到申请状态
   */
  private mapInterviewStatusToApplicationStatus(
    interviewStatus: InterviewStatus,
  ): JobApplicationStatus {
    switch (interviewStatus) {
      case InterviewStatus.PASS:
        return JobApplicationStatus.OFFER;
      case InterviewStatus.REJECTED:
        return JobApplicationStatus.REJECTED;
      case InterviewStatus.COMPLETED:
        return JobApplicationStatus.RESUME_SCREENING; // 默认返回到简历筛选状态
      default:
        return JobApplicationStatus.RESUME_SCREENING;
    }
  }

  /**
   * 将面试轮次枚举映射为中文文本
   */
  private mapInterviewRoundToText(round: InterviewRound): string {
    switch (round) {
      case InterviewRound.FIRST_INTERVIEW:
        return '一面';
      case InterviewRound.SECOND_INTERVIEW:
        return '二面';
      case InterviewRound.HR_INTERVIEW:
        return 'HR面试';
      default:
        return '面试';
    }
  }

  /**
   * 验证面试邀请码
   * @param dto 邀请码信息
   * @returns 面试信息
   */
  async verifyInvitation(dto: VerifyInvitationCodeDto) {
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
        title: `${interview.application.job.title} - ${this.mapInterviewRoundToText(interview.round)}`,
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
