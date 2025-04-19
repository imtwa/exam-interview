import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaClient } from '../../../prisma/generated/client';
import { LoggerService } from '../../common/logger/logger.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { QueryJobDto } from './dto/query-job.dto';
import { JobStatus } from '../../common/enums/job-status.enum';
import { CreateInterviewerDto } from './dto/create-interviewer.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { ProfileSetupDto } from './dto/profile-setup.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { QueryJobApplicationDto } from './dto/query-job-application.dto';

/**
 * 职位服务 - 处理职位管理相关的业务逻辑
 *
 * 使用Prisma进行数据库操作
 */
@Injectable()
export class JobService {
  private readonly logger: LoggerService;

  constructor(
    @Inject('PRISMA_CLIENT')
    private prisma: PrismaClient,
    private loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext('JobService');
  }

  /**
   * 获取职位列表
   *
   * @param queryJobDto 查询参数
   * 示例:
   * {
   *   "page": 1,
   *   "pageSize": 10,
   *   "keyword": "前端开发",
   *   "city": "北京",
   *   "companyId": 1,
   *   "subCategoryId": 2
   * }
   *
   * @returns 职位列表和分页信息
   */
  async getJobList(queryJobDto: QueryJobDto) {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      companyId,
      subCategoryId,
      city,
      salaryMin,
      salaryMax,
    } = queryJobDto;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where = {
      deletedAt: null, // 只查询未删除的记录
      status: JobStatus.ACTIVE, // 只查询招聘中的职位
      ...(keyword && {
        OR: [
          { title: { contains: keyword } },
          { description: { contains: keyword } },
          { requirements: { contains: keyword } },
        ],
      }),
      ...(companyId && { companyId: companyId }),
      ...(subCategoryId && { subCategoryId: subCategoryId }),
      ...(city && { city: city }),
      ...(salaryMin && { salaryMin: { gte: salaryMin } }),
      ...(salaryMax && { salaryMax: { lte: salaryMax } }),
    };

    // 查询总数
    const total = await this.prisma.jobPosting.count({ where });

    // 查询数据
    const list = await this.prisma.jobPosting.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            fundingStage: true,
            size: true,
            industry: true,
          },
        },
        subCategory: {
          select: {
            id: true,
            name: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(
      `获取职位列表：page=${page}, pageSize=${pageSize}, total=${total}`,
    );

    return {
      list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * 获取职位详情
   *
   * @param id 职位ID
   * 示例: 1
   *
   * @returns 职位详情，包含公司和面试官信息
   */
  async getJobDetail(id: number) {
    const job = await this.prisma.jobPosting.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            description: true,
            foundedYear: true,
            fundingStage: true,
            size: true,
            industry: true,
          },
        },
        interviewer: {
          select: {
            id: true,
            position: true,
          },
        },
        subCategory: {
          select: {
            id: true,
            name: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      this.logger.warn(`职位不存在: ${id}`);
      throw new NotFoundException('职位不存在');
    }

    this.logger.log(`获取职位详情: ${id}`);
    return job;
  }

  /**
   * 创建职位
   *
   * @param createJobDto 创建职位参数
   * 示例:
   * {
   *   "title": "前端开发工程师",
   *   "description": "负责公司前端开发",
   *   "requirements": "熟悉React、Vue等框架",
   *   "city": "北京",
   *   "salaryMin": 15000,
   *   "salaryMax": 25000,
   *   "companyId": 1,
   *   "interviewerId": 1,
   *   "subCategoryId": 2
   * }
   *
   * @returns 创建的职位信息
   */
  async createJob(createJobDto: CreateJobDto) {
    // 检查面试官
    const interviewer = await this.prisma.interviewer.findUnique({
      where: { id: createJobDto.interviewerId },
    });

    if (!interviewer) {
      this.logger.warn(
        `创建职位失败: 面试官不存在 ${createJobDto.interviewerId}`,
      );
      throw new BadRequestException('面试官不存在');
    }

    // 检查公司
    const company = await this.prisma.company.findUnique({
      where: { id: createJobDto.companyId },
    });

    if (!company) {
      this.logger.warn(`创建职位失败: 公司不存在 ${createJobDto.companyId}`);
      throw new BadRequestException('公司不存在');
    }

    // 检查面试官是否属于该公司
    if (interviewer.companyId !== createJobDto.companyId) {
      this.logger.warn(
        `创建职位失败: 面试官不属于该公司 ${createJobDto.interviewerId}/${createJobDto.companyId}`,
      );
      throw new BadRequestException('面试官不属于该公司');
    }

    // 检查行业分类
    const subCategory = await this.prisma.industrySubCategory.findUnique({
      where: { id: createJobDto.subCategoryId },
    });

    if (!subCategory) {
      this.logger.warn(
        `创建职位失败: 行业分类不存在 ${createJobDto.subCategoryId}`,
      );
      throw new BadRequestException('行业分类不存在');
    }

    // 创建职位
    const job = await this.prisma.jobPosting.create({
      data: {
        ...createJobDto,
        status: JobStatus.ACTIVE,
      },
    });

    this.logger.log(`创建职位成功: ${job.id}, 标题: ${job.title}`);
    return job;
  }

  /**
   * 更新职位
   *
   * @param id 职位ID
   * @param updateJobDto 更新职位参数
   * 示例:
   * {
   *   "title": "资深前端开发工程师",
   *   "salaryMin": 20000,
   *   "salaryMax": 30000
   * }
   *
   * @returns 更新后的职位信息
   */
  async updateJob(id: number, updateJobDto: UpdateJobDto) {
    // 检查职位是否存在
    const job = await this.prisma.jobPosting.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!job) {
      this.logger.warn(`更新职位失败: 职位不存在 ${id}`);
      throw new NotFoundException('职位不存在');
    }

    // 如果更新了面试官，检查面试官是否存在且属于公司
    if (updateJobDto.interviewerId) {
      const interviewer = await this.prisma.interviewer.findUnique({
        where: { id: updateJobDto.interviewerId },
      });

      if (!interviewer) {
        this.logger.warn(
          `更新职位失败: 面试官不存在 ${updateJobDto.interviewerId}`,
        );
        throw new BadRequestException('面试官不存在');
      }

      const companyId = updateJobDto.companyId || job.companyId;
      if (interviewer.companyId !== companyId) {
        this.logger.warn(
          `更新职位失败: 面试官不属于该公司 ${updateJobDto.interviewerId}/${companyId}`,
        );
        throw new BadRequestException('面试官不属于该公司');
      }
    }

    // 如果更新了公司，检查公司是否存在
    if (updateJobDto.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: updateJobDto.companyId },
      });

      if (!company) {
        this.logger.warn(`更新职位失败: 公司不存在 ${updateJobDto.companyId}`);
        throw new BadRequestException('公司不存在');
      }
    }

    // 如果更新了行业分类，检查行业分类是否存在
    if (updateJobDto.subCategoryId) {
      const subCategory = await this.prisma.industrySubCategory.findUnique({
        where: { id: updateJobDto.subCategoryId },
      });

      if (!subCategory) {
        this.logger.warn(
          `更新职位失败: 行业分类不存在 ${updateJobDto.subCategoryId}`,
        );
        throw new BadRequestException('行业分类不存在');
      }
    }

    // 更新职位
    const updatedJob = await this.prisma.jobPosting.update({
      where: { id },
      data: updateJobDto,
    });

    this.logger.log(`更新职位成功: ${id}`);
    return updatedJob;
  }

  /**
   * 删除职位（软删除）
   *
   * @param id 职位ID
   * 示例: 1
   */
  async deleteJob(id: number) {
    // 检查职位是否存在
    const job = await this.prisma.jobPosting.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!job) {
      this.logger.warn(`删除职位失败: 职位不存在 ${id}`);
      throw new NotFoundException('职位不存在');
    }

    // 软删除职位
    await this.prisma.jobPosting.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: JobStatus.EXPIRED,
      },
    });

    this.logger.log(`删除职位成功: ${id}`);
  }

  /**
   * 检查用户是否已设置用户资料
   *
   * @param userId 用户ID
   * 示例: 1
   *
   * @returns 用户资料信息，包括角色和面试官信息
   */
  async checkUserProfile(userId: number) {
    this.logger.log(`检查用户是否已设置用户资料: ${userId}`);

    // 获取用户
    const user = await this.prisma.frontUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`用户不存在: ${userId}`);
      throw new NotFoundException('用户不存在');
    }

    const result = {
      isProfileCompleted: false,
      role: user.role,
      isInterviewer: user.role === UserRole.INTERVIEWER,
      interviewer: null,
      company: null,
    };

    // 如果是面试官，检查是否已设置面试官信息和公司信息
    if (user.role === UserRole.INTERVIEWER) {
      const interviewer = await this.prisma.interviewer.findFirst({
        where: { userId, deletedAt: null },
        include: {
          company: true,
        },
      });

      if (interviewer) {
        result.interviewer = interviewer;
        result.company = interviewer.company;
        result.isProfileCompleted = true;
      }
    }

    return result;
  }
}
