import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  PrismaClient,
  InterviewStatus,
  Interviewer,
  JobApplicationStatus,
} from '../../../prisma/generated/client';
import { CreateInterviewerDto } from './dto/create-interviewer.dto';
import { LoggerService } from '../../common/logger/logger.service';
import { UpdateInterviewerProfileDto } from './dto/update-interviewer-profile.dto';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';
import { AssignExamDto } from './dto/assign-exam.dto';
import { ExamStatus } from '../../common/enums/exam-status.enum';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';

@Injectable()
export class InterviewerService {
  private readonly logger: LoggerService;

  constructor(
    @Inject('PRISMA_CLIENT') private prisma: PrismaClient,
    private configService: ConfigService,
    private emailService: EmailService,
    private loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext(InterviewerService.name);
  }

  /**
   * 根据用户ID获取面试官信息
   */
  async getInterviewerByUserId(userId: number) {
    const interviewer = await this.prisma.interviewer.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            size: true,
            address: true,
          },
        },
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    if (!interviewer) {
      throw new NotFoundException(`用户${userId}不是面试官`);
    }

    return interviewer;
  }

  /**
   * 创建或更新面试官信息
   */
  async createOrUpdateInterviewer(
    userId: number,
    companyId: number,
    createInterviewerDto: CreateInterviewerDto,
  ): Promise<Interviewer> {
    // 验证公司是否存在
    const company = await this.prisma.company.findFirst({
      where: {
        id: companyId,
        deletedAt: null,
      },
    });

    if (!company) {
      throw new BadRequestException(`公司不存在 ID: ${companyId}`);
    }

    try {
      // 检查面试官是否已存在
      const existingInterviewer = await this.prisma.interviewer.findFirst({
        where: {
          userId,
          deletedAt: null,
        },
      });

      if (existingInterviewer) {
        // 更新现有面试官信息
        const updatedInterviewer = await this.prisma.interviewer.update({
          where: {
            id: existingInterviewer.id,
          },
          data: {
            ...createInterviewerDto,
            companyId,
          },
        });

        this.logger.log(`更新面试官信息成功 ID: ${updatedInterviewer.id}`);
        return updatedInterviewer;
      } else {
        // 创建新面试官信息
        // 首先更新用户角色为面试官
        await this.prisma.frontUser.update({
          where: {
            id: userId,
          },
          data: {
            role: 'INTERVIEWER',
          },
        });

        // 创建面试官记录
        const newInterviewer = await this.prisma.interviewer.create({
          data: {
            ...createInterviewerDto,
            userId,
            companyId,
          },
        });

        this.logger.log(`创建面试官信息成功 ID: ${newInterviewer.id}`);
        return newInterviewer;
      }
    } catch (error) {
      this.logger.error(`创建/更新面试官信息失败: ${error.message}`, error);
      throw new BadRequestException('创建/更新面试官信息失败');
    }
  }

  /**
   * 获取面试官创建的职位列表
   */
  async getInterviewerJobs(userId: number, page: number, pageSize: number) {
    // 查找面试官ID
    const interviewer = await this.getInterviewerByUserId(userId);

    // 分页查询职位
    const where = {
      interviewerId: interviewer.id,
      deletedAt: null,
    };

    const total = await this.prisma.jobPosting.count({ where });
    const items = await this.prisma.jobPosting.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        company: {
          select: {
            name: true,
          },
        },
        subCategory: {
          select: {
            name: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    // 计算每个职位的申请数量
    const itemsWithCount = items.map((job) => {
      const { _count, ...jobData } = job;
      return {
        ...jobData,
        applicationsCount: _count.applications,
      };
    });

    return {
      items: itemsWithCount,
      total,
    };
  }

  /**
   * 获取面试官收到的职位申请列表
   */
  async getApplications(
    userId: number,
    page: number,
    pageSize: number,
    status?: string,
    jobId?: number,
    keyword?: string,
  ) {
    // 查找面试官ID
    const interviewer = await this.getInterviewerByUserId(userId);

    // 构建查询条件
    const where: any = {
      job: {
        interviewerId: interviewer.id,
      },
    };

    // 根据状态筛选
    if (status && status !== 'ALL') {
      where.status = status as JobApplicationStatus;
    }

    // 根据职位ID筛选
    if (jobId) {
      where.jobId = jobId;
    }

    // 关键词搜索
    if (keyword) {
      where.OR = [
        {
          jobSeeker: {
            OR: [
              { user: { email: { contains: keyword } } },
              { user: { username: { contains: keyword } } },
              {
                education: {
                  some: {
                    school: { contains: keyword },
                  },
                },
              },
            ],
          },
        },
        { job: { title: { contains: keyword } } },
      ];
    }

    const total = await this.prisma.jobApplication.count({ where });
    const items = await this.prisma.jobApplication.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
      orderBy: {
        appliedAt: 'desc',
      },
      include: {
        jobSeeker: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            education: {
              orderBy: {
                endDate: 'desc',
              },
              take: 3,
            },
            workExperience: {
              orderBy: {
                endDate: 'desc',
              },
              take: 3,
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            city: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        interviews: {
          orderBy: {
            scheduleTime: 'desc',
          },
          take: 1,
        },
      },
    });

    // 获取基础URL
    const baseUrl =
      this.configService.get('APP_URL') ||
      `http://localhost:${this.configService.get('PORT') || 3000}`;

    // 处理数据，添加必要的计算字段
    const processedItems = items.map((item) => {
      // 从教育信息获取最高学历
      const highestEducation =
        item.jobSeeker?.education?.length > 0
          ? item.jobSeeker.education[0]
          : null;

      // 根据工作经历计算总工作年限
      let totalExperience = 0;
      if (item.jobSeeker?.workExperience?.length > 0) {
        const now = new Date();
        item.jobSeeker.workExperience.forEach((exp) => {
          const startDate = new Date(exp.startDate);
          const endDate = exp.endDate ? new Date(exp.endDate) : now;

          const years = endDate.getFullYear() - startDate.getFullYear();
          const months = endDate.getMonth() - startDate.getMonth();

          totalExperience += years * 12 + months;
        });
        totalExperience = Math.round(totalExperience / 12);
      }

      // 构建候选人姓名
      const candidateName = item.jobSeeker?.user?.username || '未知候选人';

      // 处理简历URL，确保返回完整的URL
      let resumeUrl = item.jobSeeker?.resumeUrl;
      if (resumeUrl && !resumeUrl.startsWith('http')) {
        // 如果resumeUrl是相对路径，拼接完整URL
        resumeUrl = `${baseUrl}/${resumeUrl.startsWith('/') ? resumeUrl.substring(1) : resumeUrl}`;
      }

      // 如果是jobSeeker中的resumeUrl，也需要更新
      if (
        item.jobSeeker &&
        item.jobSeeker.resumeUrl &&
        !item.jobSeeker.resumeUrl.startsWith('http')
      ) {
        item.jobSeeker.resumeUrl = `${baseUrl}/${
          item.jobSeeker.resumeUrl.startsWith('/')
            ? item.jobSeeker.resumeUrl.substring(1)
            : item.jobSeeker.resumeUrl
        }`;
      }

      // 返回增强的对象
      return {
        ...item,
        candidateName,
        highestEducation,
        totalExperience,
        resumeUrl, // 添加处理后的resumeUrl
      };
    });

    return {
      items: processedItems,
      total,
    };
  }

  /**
   * 更新申请状态
   */
  async updateApplicationStatus(
    applicationId: number,
    status: string,
    userId: number,
    feedback: string,
    examId?: number,
    note?: string,
  ) {
    // 验证用户是否是面试官
    const interviewer = await this.prisma.interviewer.findFirst({
      where: { userId },
      include: {
        company: true,
      },
    });

    if (!interviewer) {
      throw new ForbiddenException('只有面试官可以更新申请状态');
    }

    // 查找申请记录
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        jobSeeker: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('申请记录不存在');
    }

    // 验证面试官是否属于该公司
    if (application.job.companyId !== interviewer.companyId) {
      throw new ForbiddenException('无权更新其他公司的申请状态');
    }

    // 更新申请状态
    const updatedApplication = await this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: status as JobApplicationStatus,
        feedback,
        updatedAt: new Date(),
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        jobSeeker: {
          include: {
            user: true,
          },
        },
      },
    });

    // 如果状态是笔试且提供了试卷ID，创建笔试分配
    if (status === 'WRITTEN_TEST' && examId) {
      await this.prisma.examAssignment.create({
        data: {
          applicationId,
          examId,
          note: note || '',
          assignedBy: userId,
          status: 'PENDING',
          jobSeekerId: application.jobSeekerId,
          examStartTime: new Date(),
          examEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 默认7天后过期
          duration: 60, // 默认60分钟
        },
      });
    }

    // 发送邮件通知
    try {
      const candidateEmail = application.jobSeeker.user.email;
      const candidateName = application.jobSeeker.user.username;
      const jobTitle = application.job.title;
      const companyName = application.job.company.name;

      if (status === 'REJECTED') {
        // 发送拒绝通知
        await this.emailService.sendMail({
          to: candidateEmail,
          subject: `[申请结果] ${companyName} - ${jobTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>申请结果通知</h2>
              <p>尊敬的 ${candidateName}：</p>
              <p>感谢您申请 ${companyName} 的 ${jobTitle} 职位。</p>
              <p>经过慎重考虑，我们很遗憾地通知您，您未能通过本次选拔。</p>
              ${feedback ? `<p><strong>反馈意见：</strong></p><p>${feedback}</p>` : ''}
              <p>感谢您对我们公司的关注，祝您求职顺利！</p>
              <p style="margin-top: 20px;">此致，<br>${companyName} 招聘团队</p>
            </div>
          `
        });
      } else if (status === 'OFFER') {
        // 发送Offer通知
        await this.emailService.sendMail({
          to: candidateEmail,
          subject: `[录用通知] ${companyName} - ${jobTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>录用通知</h2>
              <p>尊敬的 ${candidateName}：</p>
              <p>恭喜您！我们很高兴地通知您，您已成功通过 ${companyName} ${jobTitle} 职位的所有面试环节。</p>
              <p>我们诚挚地邀请您加入我们的团队！</p>
              ${note ? `<p><strong>录用说明：</strong></p><p>${note}</p>` : ''}
              ${feedback ? `<p><strong>面试反馈：</strong></p><p>${feedback}</p>` : ''}
              <p>我们期待您的加入！如有任何问题，请随时与我们联系。</p>
              <p style="margin-top: 20px;">此致，<br>${companyName} 招聘团队</p>
            </div>
          `
        });
      }
    } catch (error) {
      this.logger.error(`发送申请状态更新邮件失败: ${error.message}`, error);
      // 不因邮件发送失败而影响主流程
    }

    return updatedApplication;
  }

  /**
   * 安排面试
   * @param applicationId 职位申请ID
   * @param userId 当前用户ID
   * @param interviewData 面试数据
   */
  async scheduleInterview(
    applicationId: number,
    userId: number,
    interviewData: ScheduleInterviewDto,
  ): Promise<any> {
    // 验证用户是否是面试官
    const interviewer = await this.getInterviewerByUserId(userId);
    if (!interviewer) {
      throw new HttpException('用户不是面试官', HttpStatus.FORBIDDEN);
    }

    // 查找职位申请
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            interviewer: true,
            company: true,
          },
        },
        jobSeeker: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!application) {
      throw new HttpException('职位申请不存在', HttpStatus.NOT_FOUND);
    }

    // 验证申请是否属于此面试官
    if (application.job.interviewer.id !== interviewer.id) {
      throw new HttpException('无权操作此申请', HttpStatus.FORBIDDEN);
    }

    // 创建面试记录
    const interview = await this.prisma.interview.create({
      data: {
        application: {
          connect: { id: applicationId },
        },
        jobSeeker: {
          connect: { id: application.jobSeekerId },
        },
        interviewer: {
          connect: { id: interviewer.id },
        },
        scheduleTime: new Date(interviewData.scheduleTime),
        duration: interviewData.duration,
        round: interviewData.round,
        status: 'SCHEDULED',
        type: interviewData.type,
        location: interviewData.location,
        notes: interviewData.notes,
      },
    });

    // 更新申请状态为对应的面试轮次
    await this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: this.mapRoundToApplicationStatus(interviewData.round),
      },
    });

    // 如果需要发送邮件通知
    if (interviewData.sendEmail) {
      try {
        // 获取求职者用户信息
        const jobSeekerUser = await this.prisma.frontUser.findUnique({
          where: { id: application.jobSeeker.userId },
        });

        if (jobSeekerUser && jobSeekerUser.email) {
          // 格式化日期，使用原生JavaScript方法
          const formattedDate = new Date(
            interviewData.scheduleTime,
          ).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });

          await this.emailService.sendInterviewInvitation({
            to: jobSeekerUser.email,
            candidateName: jobSeekerUser.username,
            jobTitle: application.job.title,
            companyName: application.job.company.name,
            interviewTime: formattedDate,
            interviewType: this.getInterviewTypeText(interviewData.type),
            interviewLocation: interviewData.location || '线上面试',
            interviewNotes: interviewData.notes || '无',
            verificationLink: `${this.configService.get('FRONTEND_URL') || 'http://localhost:3001'}/online-interview/session/${interview.invitationCode}`,
            round: this.getInterviewRoundText(interviewData.round),
          });
          this.logger.log(`成功发送面试邀请邮件至 ${jobSeekerUser.email}`);
        }
      } catch (error) {
        this.logger.error(`发送面试邀请邮件失败: ${error.message}`, error);
        // 不要因为邮件发送失败而中断整个流程
      }
    }

    return interview;
  }

  /**
   * 将面试轮次映射到对应的申请状态
   */
  private mapRoundToApplicationStatus(round: string): JobApplicationStatus {
    switch (round) {
      case 'FIRST_INTERVIEW':
        return JobApplicationStatus.FIRST_INTERVIEW;
      case 'SECOND_INTERVIEW':
        return JobApplicationStatus.SECOND_INTERVIEW;
      case 'HR_INTERVIEW':
        return JobApplicationStatus.HR_INTERVIEW;
      default:
        return JobApplicationStatus.FIRST_INTERVIEW;
    }
  }

  /**
   * 获取面试轮次文本表示
   */
  private getInterviewRoundText(round: string): string {
    const roundMap = {
      FIRST_INTERVIEW: '一面',
      SECOND_INTERVIEW: '二面',
      HR_INTERVIEW: 'HR面试',
    };
    return roundMap[round] || '面试';
  }

  /**
   * 获取面试类型文本表示
   */
  private getInterviewTypeText(type: string): string {
    const typeMap = {
      phone: '电话面试',
      video: '视频面试',
      onsite: '现场面试',
    };
    return typeMap[type] || '面试';
  }

  /**
   * 更新面试官资料，支持同时创建公司
   */
  async updateInterviewerProfile(
    userId: number,
    profileDto: UpdateInterviewerProfileDto,
  ) {
    this.logger.log(
      `更新用户${userId}的面试官资料，使用已有公司: ${profileDto.useExistingCompany}`,
    );

    let companyId: number | null = null;

    // 处理公司信息
    if (profileDto.useExistingCompany) {
      // 使用现有公司
      if (profileDto.existingCompanyId) {
        // 验证公司是否存在
        const company = await this.prisma.company.findFirst({
          where: {
            id: profileDto.existingCompanyId,
            deletedAt: null,
          },
        });

        if (!company) {
          throw new NotFoundException(
            `公司不存在 ID: ${profileDto.existingCompanyId}`,
          );
        }

        companyId = profileDto.existingCompanyId;
      } else {
        // 用户选择使用现有公司但未提供公司ID
        this.logger.log('用户选择使用现有公司但未提供公司ID');
      }
    } else if (profileDto.company) {
      // 创建新公司
      try {
        // 创建新公司
        const newCompany = await this.prisma.company.create({
          data: {
            ...profileDto.company,
            verificationStatus: 'PENDING',
          },
        });

        this.logger.log(`为用户${userId}创建新公司成功 ID: ${newCompany.id}`);
        companyId = newCompany.id;
      } catch (error) {
        this.logger.error(`创建新公司失败: ${error.message}`, error);
        throw new BadRequestException('创建公司失败: ' + error.message);
      }
    } else {
      // 用户既不使用现有公司也不创建新公司
      this.logger.log(`用户${userId}选择不关联任何公司`);
    }

    try {
      // 检查面试官是否已存在
      const existingInterviewer = await this.prisma.interviewer.findFirst({
        where: {
          userId,
          deletedAt: null,
        },
      });

      // 面试官的基本数据（必须字段）
      const baseData = {
        position: profileDto.interviewer.position,
      };

      // 可选的性别字段
      if (profileDto.interviewer.gender) {
        baseData['gender'] = profileDto.interviewer.gender;
      }

      // 创建或更新面试官
      let interviewer;
      if (existingInterviewer) {
        // 更新现有面试官信息 - 构建更新数据
        const updateData = { ...baseData };

        // 只在有companyId时才添加到更新数据中
        if (companyId !== null) {
          updateData['companyId'] = companyId;
        }

        interviewer = await this.prisma.interviewer.update({
          where: {
            id: existingInterviewer.id,
          },
          data: updateData,
          include: {
            company: {
              select: {
                id: true,
                name: true,
                industry: true,
                address: true,
                size: true,
                fundingStage: true,
              },
            },
            user: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        });

        this.logger.log(`更新面试官信息成功 ID: ${interviewer.id}`);
      } else {
        // 更新用户角色为面试官
        await this.prisma.frontUser.update({
          where: {
            id: userId,
          },
          data: {
            role: 'INTERVIEWER',
          },
        });

        // 创建面试官记录 - 构建创建数据
        const createData: any = {
          ...baseData,
        };

        // 使用正确的方式设置关联
        if (companyId !== null) {
          createData.company = {
            connect: { id: companyId },
          };
        }

        // 设置用户关联
        createData.user = {
          connect: { id: userId },
        };

        interviewer = await this.prisma.interviewer.create({
          data: createData,
          include: {
            company: {
              select: {
                id: true,
                name: true,
                industry: true,
                address: true,
                size: true,
                fundingStage: true,
              },
            },
            user: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        });

        this.logger.log(`创建面试官信息成功 ID: ${interviewer.id}`);
      }

      return interviewer;
    } catch (error) {
      this.logger.error(`创建/更新面试官信息失败: ${error.message}`, error);
      throw new BadRequestException(
        '创建/更新面试官信息失败: ' + error.message,
      );
    }
  }

  /**
   * 分配笔试试卷并发送邮件通知
   * @param userId 操作者ID(面试官)
   * @param assignExamDto 分配试卷DTO
   */
  async assignExamToCandidate(userId: number, assignExamDto: AssignExamDto) {
    // 查找面试官ID以验证权限
    const interviewer = await this.getInterviewerByUserId(userId);

    // 查找申请
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: assignExamDto.applicationId },
      include: {
        job: true,
        jobSeeker: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException(
        `申请不存在 ID: ${assignExamDto.applicationId}`,
      );
    }

    // 确认该申请属于此面试官负责的职位
    if (application.job.interviewerId !== interviewer.id) {
      throw new ForbiddenException('您无权为此申请分配笔试');
    }

    // 验证试卷是否存在
    const exam = await this.prisma.examPaper.findUnique({
      where: { id: assignExamDto.examId },
    });

    if (!exam) {
      throw new NotFoundException(`试卷不存在 ID: ${assignExamDto.examId}`);
    }

    // 使用传递进来的jobSeekerId或从application中获取
    const seekerId = assignExamDto.jobSeekerId || application.jobSeekerId;

    // 检查是否已经分配过此试卷
    const existingAssignment = await this.prisma.examAssignment.findFirst({
      where: {
        applicationId: assignExamDto.applicationId,
        examId: assignExamDto.examId,
        jobSeekerId: seekerId,
        status: 'PENDING', // 只检查待完成的分配
      },
    });

    if (existingAssignment) {
      // 已存在分配，返回现有分配信息
      this.logger.log(
        `申请ID:${assignExamDto.applicationId}已分配过试卷ID:${assignExamDto.examId}`,
      );
      return existingAssignment;
    }

    // 生成随机邀请码
    const invitationCode = crypto.randomBytes(5).toString('hex').toUpperCase();

    // 设置考试时间
    const startTime = assignExamDto.examStartTime
      ? new Date(assignExamDto.examStartTime)
      : new Date();
    const endTime = assignExamDto.examEndTime
      ? new Date(assignExamDto.examEndTime)
      : new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000); // 默认7天后截止
    const examDuration = assignExamDto.duration || 120; // 默认120分钟

    // 创建笔试记录
    const examAssignment = await this.prisma.examAssignment.create({
      data: {
        applicationId: assignExamDto.applicationId,
        examId: assignExamDto.examId,
        note: assignExamDto.note || '',
        assignedBy: userId,
        status: 'PENDING', // 初始状态为待完成
        jobSeekerId: seekerId,
        invitationCode,
        examStartTime: startTime,
        examEndTime: endTime,
        duration: examDuration,
        completed: false,
      },
    });

    // 更新申请状态为笔试
    await this.prisma.jobApplication.update({
      where: { id: assignExamDto.applicationId },
      data: {
        status: 'WRITTEN_TEST',
      },
    });

    this.logger.log(
      `为申请ID:${assignExamDto.applicationId}分配笔试试卷ID:${assignExamDto.examId}`,
    );

    // 生成考试链接
    const baseUrl =
      this.configService.get('FRONTEND_URL') || 'http://127.0.0.1:5173';
    const examUrl = `${baseUrl}/exam-session/${invitationCode}`;

    // 获取求职者信息
    const candidate = application.jobSeeker.user;
    const candidateName = candidate.username || '求职者';
    const candidateEmail = candidate.email;

    // 获取职位信息
    const jobTitle = application.job.title || '职位';
    const companyName = interviewer.company ? interviewer.company.name : '公司';

    // 构建邮件内容
    if (candidateEmail) {
      try {
        // 格式化考试时间
        const startTimeStr = startTime
          ? new Date(startTime).toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '立即';
        const endTimeStr = endTime
          ? new Date(endTime).toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '无限制';

        // 使用 EmailService 发送邮件通知
        await this.emailService.sendMail({
          to: candidateEmail,
          subject: `[笔试通知] ${companyName}邀请您参加"${jobTitle}"职位的在线笔试`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
              <h2 style="color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px;">笔试邀请</h2>
              <p>尊敬的 ${candidateName}：</p>
              <p>感谢您申请 <strong>${companyName}</strong> 的 <strong>${jobTitle}</strong> 职位。</p>
              <p>我们很高兴地通知您，您已进入笔试环节。请通过以下链接参加在线笔试：</p>
              <div style="margin: 20px 0; text-align: center;">
                <a href="${examUrl}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">开始笔试</a>
              </div>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0;"><strong>笔试链接：</strong> <a href="${examUrl}">${examUrl}</a></p>
                <p style="margin: 5px 0;"><strong>邀请码：</strong> ${invitationCode}</p>
                <p style="margin: 5px 0;"><strong>考试时长：</strong> ${examDuration} 分钟</p>
                <p style="margin: 5px 0;"><strong>开始时间：</strong> ${startTimeStr}</p>
                <p style="margin: 5px 0;"><strong>截止时间：</strong> ${endTimeStr}</p>
                ${assignExamDto.note ? `<p style="margin: 10px 0 0;"><strong>笔试说明：</strong> ${assignExamDto.note}</p>` : ''}
              </div>
              <p>请在考试截止时间前完成笔试，以便我们继续为您安排后续面试环节。</p>
              <p>如有任何问题，请及时与我们联系。</p>
              <p style="margin-top: 20px;">祝好，<br>${companyName} 招聘团队</p>
            </div>
          `,
        });

        this.logger.log(
          `已向候选人${candidateName}(${candidateEmail})发送笔试邀请邮件`,
        );
      } catch (error) {
        this.logger.error(`发送笔试邀请邮件失败: ${error.message}`, error);
        // 即使邮件发送失败，我们也继续返回笔试分配信息
      }
    } else {
      this.logger.warn(`候选人ID:${seekerId}没有邮箱，无法发送笔试邀请`);
    }

    return {
      ...examAssignment,
      examUrl,
    };
  }

  /**
   * 获取面试官管理的考试列表
   * @param userId 面试官用户ID
   * @param queryDto 查询参数
   */
  async getInterviewerExams(userId: number, queryDto: any) {
    // 查找面试官信息
    const interviewer = await this.getInterviewerByUserId(userId);
    if (!interviewer) {
      throw new ForbiddenException('只有面试官可以查看考试列表');
    }

    const {
      page = 1,
      pageSize = 10,
      jobId,
      candidateName,
      status,
      keyword,
    } = queryDto;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // 构建查询条件
    const where: any = {
      application: {
        job: {
          interviewerId: interviewer.id,
        },
      },
    };

    // 添加条件过滤
    if (jobId) {
      where.application.jobId = Number(jobId);
    }

    if (status) {
      where.status = status;
    }

    if (candidateName) {
      where.application.jobSeeker = {
        user: {
          username: {
            contains: candidateName,
            mode: 'insensitive',
          },
        },
      };
    }

    if (keyword) {
      where.examPaper = {
        name: {
          contains: keyword,
          mode: 'insensitive',
        },
      };
    }

    try {
      // 查询考试分配记录
      const [assignments, total] = await Promise.all([
        this.prisma.examAssignment.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            examPaper: true,
            application: {
              include: {
                jobSeeker: {
                  include: {
                    user: true,
                  },
                },
                job: true,
              },
            },
          },
        }),
        this.prisma.examAssignment.count({ where }),
      ]);

      // 格式化返回数据
      const items = assignments.map((assignment) => {
        const job = assignment.application.job;
        const jobSeeker = assignment.application.jobSeeker;
        const user = jobSeeker.user;

        // 判断考试状态 - 如果超过了截止时间但未完成，标记为过期
        let status = assignment.status;
        if (
          status === ExamStatus.PENDING &&
          new Date() > assignment.examEndTime
        ) {
          status = ExamStatus.EXPIRED;
        }

        return {
          id: assignment.id,
          examId: assignment.examId,
          examTitle: assignment.examPaper?.name || '未命名考试',
          duration: assignment.duration,
          startTime: assignment.examStartTime,
          endTime: assignment.examEndTime,
          status,
          score: assignment.score,
          submittedAt: assignment.completed ? assignment.updatedAt : null,
          invitationCode: assignment.invitationCode,
          positionId: job.id,
          positionName: job.title,
          candidateId: jobSeeker.id,
          candidateName: user.username || user.email,
          candidateEmail: user.email,
        };
      });

      return { items, total };
    } catch (error) {
      this.logger.error(
        `获取面试官考试列表失败: ${error.message}`,
        error.stack,
      );
      throw new Error('获取考试列表失败');
    }
  }

  /**
   * 延长考试截止时间
   * @param userId 面试官用户ID
   * @param examAssignmentId 考试分配ID
   * @param newEndTime 新截止时间
   */
  async extendExamDeadline(
    userId: number,
    examAssignmentId: number,
    newEndTime: Date,
  ) {
    // 查找面试官信息
    const interviewer = await this.getInterviewerByUserId(userId);
    if (!interviewer) {
      throw new ForbiddenException('只有面试官可以延长考试时间');
    }

    // 查找考试分配记录
    const assignment = await this.prisma.examAssignment.findUnique({
      where: { id: examAssignmentId },
      include: {
        examPaper: true,
        application: {
          include: {
            job: true,
            jobSeeker: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('考试记录不存在');
    }

    // 验证面试官权限
    if (assignment.application.job.interviewerId !== interviewer.id) {
      throw new ForbiddenException('您无权操作此考试');
    }

    // 验证考试状态（不能修改已完成的考试）
    if (assignment.status === ExamStatus.COMPLETED) {
      throw new BadRequestException('已完成的考试不能延长时间');
    }

    // 验证新截止时间
    if (newEndTime <= new Date()) {
      throw new BadRequestException('新截止时间必须在当前时间之后');
    }

    // 更新截止时间
    const updatedAssignment = await this.prisma.examAssignment.update({
      where: { id: examAssignmentId },
      data: {
        examEndTime: newEndTime,
        // 如果之前状态为过期，且现在时间小于新截止时间，则恢复为待完成状态
        status:
          assignment.status === ExamStatus.EXPIRED
            ? ExamStatus.PENDING
            : assignment.status,
      },
    });

    // 发送邮件通知考生
    try {
      const candidate = assignment.application.jobSeeker.user;
      const examTitle = assignment.examPaper?.name || '考试';

      await this.emailService.sendMail({
        to: candidate.email,
        subject: `[考试时间延长] ${examTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>您的考试时间已延长</h2>
            <p>尊敬的 ${candidate.username || '考生'}，</p>
            <p>您的考试 "${examTitle}" 截止时间已调整：</p>
            <ul>
              <li>原截止时间：${new Date(assignment.examEndTime).toLocaleString('zh-CN')}</li>
              <li>新截止时间：${new Date(newEndTime).toLocaleString('zh-CN')}</li>
            </ul>
            <p>请在新的截止时间前完成考试。</p>
            <p>点击下方链接进入考试：</p>
            <p>
              <a href="${this.configService.get('FRONTEND_URL')}/online-exam/session/${assignment.invitationCode}" 
                 style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                 进入考试
              </a>
            </p>
            <p>祝您考试顺利！</p>
          </div>
        `,
      });
    } catch (emailError) {
      this.logger.error(
        `发送延期邮件失败: ${emailError.message}`,
        emailError.stack,
      );
      // 不因邮件发送失败而影响主流程
    }

    return updatedAssignment;
  }

  /**
   * 发送考试提醒邮件
   * @param userId 面试官用户ID
   * @param examAssignmentId 考试分配ID
   */
  async sendExamReminder(userId: number, examAssignmentId: number) {
    // 查找面试官信息
    const interviewer = await this.getInterviewerByUserId(userId);
    if (!interviewer) {
      throw new ForbiddenException('只有面试官可以发送提醒');
    }

    // 查找考试分配记录
    const assignment = await this.prisma.examAssignment.findUnique({
      where: { id: examAssignmentId },
      include: {
        examPaper: true,
        application: {
          include: {
            job: true,
            jobSeeker: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('考试记录不存在');
    }

    // 验证面试官权限
    if (assignment.application.job.interviewerId !== interviewer.id) {
      throw new ForbiddenException('您无权操作此考试');
    }

    // 验证考试状态
    if (assignment.status !== ExamStatus.PENDING) {
      throw new BadRequestException('只能为待完成的考试发送提醒');
    }

    // 验证考试时间有效
    if (new Date() > assignment.examEndTime) {
      throw new BadRequestException('考试已过期，无法发送提醒');
    }

    // 获取考生信息
    const candidate = assignment.application.jobSeeker.user;
    const examTitle = assignment.examPaper?.name || '考试';
    const jobTitle = assignment.application.job.title || '职位';
    const companyName = interviewer.company?.name || '公司';

    // 发送提醒邮件
    await this.emailService.sendMail({
      to: candidate.email,
      subject: `[考试提醒] ${companyName}邀请您完成"${jobTitle}"职位的笔试`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>考试提醒</h2>
          <p>尊敬的 ${candidate.username || '考生'}，</p>
          <p>您有一份待完成的考试："${examTitle}"，请及时完成。</p>
          <ul>
            <li>开始时间：${new Date(assignment.examStartTime).toLocaleString('zh-CN')}</li>
            <li>截止时间：${new Date(assignment.examEndTime).toLocaleString('zh-CN')}</li>
            <li>考试时长：${assignment.duration}分钟</li>
          </ul>
          <p>点击下方链接进入考试：</p>
          <p>
            <a href="${this.configService.get('FRONTEND_URL')}/online-exam/session/${assignment.invitationCode}" 
               style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
               开始考试
            </a>
          </p>
          <p>祝您考试顺利！</p>
        </div>
      `,
    });

    return { success: true };
  }

  /**
   * 取消考试
   * @param userId 面试官用户ID
   * @param examAssignmentId 考试分配ID
   */
  async cancelExam(userId: number, examAssignmentId: number) {
    // 查找面试官信息
    const interviewer = await this.getInterviewerByUserId(userId);
    if (!interviewer) {
      throw new ForbiddenException('只有面试官可以取消考试');
    }

    // 查找考试分配记录
    const assignment = await this.prisma.examAssignment.findUnique({
      where: { id: examAssignmentId },
      include: {
        examPaper: true,
        application: {
          include: {
            job: true,
            jobSeeker: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('考试记录不存在');
    }

    // 验证面试官权限
    if (assignment.application.job.interviewerId !== interviewer.id) {
      throw new ForbiddenException('您无权操作此考试');
    }

    // 验证考试状态
    if (assignment.status === ExamStatus.COMPLETED) {
      throw new BadRequestException('已完成的考试不能取消');
    }

    // 获取考生信息
    const candidate = assignment.application.jobSeeker.user;
    const examTitle = assignment.examPaper?.name || '考试';

    // 更新考试状态为过期
    const updatedAssignment = await this.prisma.examAssignment.update({
      where: { id: examAssignmentId },
      data: {
        status: ExamStatus.EXPIRED,
        note: assignment.note ? `${assignment.note} [已取消]` : '已取消',
      },
    });

    // 发送邮件通知考生
    try {
      await this.emailService.sendMail({
        to: candidate.email,
        subject: `[考试取消] ${examTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>考试已取消</h2>
            <p>尊敬的 ${candidate.username || '考生'}，</p>
            <p>您的考试 "${examTitle}" 已被取消。</p>
            <p>职位：${assignment.application.job.title || '职位'}</p>
            <p>公司：${interviewer.company?.name || '公司'}</p>
            <p>如有疑问，请联系招聘方。</p>
          </div>
        `,
      });
    } catch (emailError) {
      this.logger.error(
        `发送取消邮件失败: ${emailError.message}`,
        emailError.stack,
      );
      // 不因邮件发送失败而影响主流程
    }

    return updatedAssignment;
  }

  /**
   * 提交面试评价
   * @param interviewId 面试ID
   * @param userId 当前用户ID
   * @param feedbackData 评价数据
   */
  async submitInterviewFeedback(
    interviewId: number,
    userId: number,
    feedbackData: any,
  ): Promise<any> {
    // 验证用户是否是面试官
    const interviewer = await this.getInterviewerByUserId(userId);
    if (!interviewer) {
      throw new HttpException('用户不是面试官', HttpStatus.FORBIDDEN);
    }

    // 查找面试记录
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          include: {
            job: {
              include: {
                company: true,
              },
            },
            jobSeeker: {
              include: {
                user: true,
              },
            },
          },
        },
        jobSeeker: {
          include: {
            user: true,
          },
        },
        interviewer: true,
      },
    });

    if (!interview) {
      throw new HttpException('面试不存在', HttpStatus.NOT_FOUND);
    }

    // 验证面试是否属于此面试官
    if (interview.interviewerId !== interviewer.id) {
      throw new HttpException('无权操作此面试', HttpStatus.FORBIDDEN);
    }

    // 更新面试状态和评价
    const updatedInterview = await this.prisma.interview.update({
      where: { id: interviewId },
      data: {
        status: 'COMPLETED',
        feedback: feedbackData.feedback,
        feedbackRating: feedbackData.feedbackRating,
      },
    });

    // 更新申请状态
    let newStatus = interview.application.status;
    if (feedbackData.status === 'PASS') {
      // 如果通过了面试
      if (feedbackData.scheduleNextRound) {
        // 如果需要进入下一轮面试
        newStatus = feedbackData.scheduleNextRound;
      } else if (interview.round === 'HR_INTERVIEW') {
        // 如果是HR面试且通过，发放Offer
        newStatus = 'OFFER';
      }
    } else if (feedbackData.status === 'REJECTED') {
      // 如果面试未通过
      newStatus = 'REJECTED';
    }

    await this.prisma.jobApplication.update({
      where: { id: interview.applicationId },
      data: {
        status: newStatus,
      },
    });

    return updatedInterview;
  }
}
