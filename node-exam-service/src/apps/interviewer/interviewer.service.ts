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
  Interviewer,
} from '../../../prisma/generated/client';
import { CreateInterviewerDto } from './dto/create-interviewer.dto';
import { LoggerService } from '../../common/logger/logger.service';
import { UpdateInterviewerProfileDto } from './dto/update-interviewer-profile.dto';

@Injectable()
export class InterviewerService {
  private readonly logger: LoggerService;

  constructor(
    @Inject('PRISMA_CLIENT') private prisma: PrismaClient,
    loggerService: LoggerService,
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
      where.status = status as InterviewStatus;
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
          select: {
            gender: true,
            expectedPosition: true,
            user: {
              select: {
                email: true,
              },
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

    return {
      items,
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
  ) {
    // 查找面试官ID以验证权限
    const interviewer = await this.getInterviewerByUserId(userId);

    // 查找申请
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
      },
    });

    if (!application) {
      throw new NotFoundException(`申请不存在 ID: ${applicationId}`);
    }

    // 确认该申请属于此面试官负责的职位
    if (application.job.interviewerId !== interviewer.id) {
      throw new ForbiddenException('您无权更新此申请的状态');
    }

    // 更新申请状态
    const updatedApplication = await this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: status as InterviewStatus,
      },
    });

    // 如果还有其他相关业务逻辑，比如发送通知等，可以在这里添加

    return updatedApplication;
  }

  /**
   * 安排面试
   */
  async scheduleInterview(
    applicationId: number,
    userId: number,
    scheduleTime: Date,
    duration: number,
    meetingLink?: string,
  ) {
    // 查找面试官ID以验证权限
    const interviewer = await this.getInterviewerByUserId(userId);

    // 查找申请
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
      },
    });

    if (!application) {
      throw new NotFoundException(`申请不存在 ID: ${applicationId}`);
    }

    // 确认该申请属于此面试官负责的职位
    if (application.job.interviewerId !== interviewer.id) {
      throw new ForbiddenException('您无权为此申请安排面试');
    }

    // 创建面试记录
    const interview = await this.prisma.interview.create({
      data: {
        applicationId,
        scheduleTime,
        duration,
        meetingLink,
        status: InterviewStatus.SCHEDULED,
      },
    });

    // 更新申请状态为已安排面试
    await this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: InterviewStatus.SCHEDULED,
      },
    });

    return interview;
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
        // 用户选择使用现有公司但没有提供ID
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
}
