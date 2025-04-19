import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  PrismaClient,
  JobPosting,
  JobStatus,
} from '../../../../prisma/generated/client';
import { QueryJobDto } from '../dto/query-job.dto';
import { CreateJobDto } from '../dto/create-job.dto';
import { UpdateJobDto } from '../dto/update-job.dto';
import { LoggerService } from '../../../common/logger/logger.service';

@Injectable()
export class JobService {
  private readonly logger: LoggerService;

  constructor(
    @Inject('PRISMA_CLIENT') private prisma: PrismaClient,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext(JobService.name);
  }

  /**
   * 获取职位列表，支持分页、筛选和排序
   */
  async getJobList(queryJobDto: QueryJobDto) {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      city,
      salaryMin,
      salaryMax,
      companyId,
      subCategoryId,
      isRemote,
      experienceReq,
      educationReq,
      sortField = 'createdAt',
      sortOrder = 'desc',
    } = queryJobDto;

    // 构建过滤条件
    const where: any = {
      deletedAt: null,
      status: 'ACTIVE',
    };

    // 关键词搜索（职位标题）
    if (keyword) {
      where.title = {
        contains: keyword,
      };
    }

    // 城市筛选
    if (city) {
      where.city = city;
    }

    // 公司ID筛选
    if (companyId) {
      where.companyId = parseInt(companyId.toString());
    }

    // 行业分类筛选
    if (subCategoryId) {
      where.subCategoryId = parseInt(subCategoryId.toString());
    }

    // 远程工作筛选
    if (isRemote !== undefined) {
      where.isRemote = isRemote === 'true';
    }

    // 薪资范围筛选
    if (salaryMin) {
      where.salaryMax = {
        gte: parseInt(salaryMin.toString()),
      };
    }

    if (salaryMax) {
      where.salaryMin = {
        lte: parseInt(salaryMax.toString()),
      };
    }

    // 经验要求筛选
    if (experienceReq) {
      where.experienceReq = {
        lte: parseInt(experienceReq.toString()),
      };
    }

    // 学历要求筛选
    if (educationReq) {
      where.educationReq = educationReq;
    }

    // 排序条件
    const orderBy: any = {};
    orderBy[sortField] = sortOrder;

    // 查询总记录数
    const total = await this.prisma.jobPosting.count({ where });

    // 查询分页数据
    const items = await this.prisma.jobPosting.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
      orderBy,
      include: {
        company: {
          select: {
            name: true,
            industry: true,
            size: true,
            address: true,
            foundedYear: true,
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

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取职位详情
   */
  async getJobDetail(id: number): Promise<JobPosting> {
    const job = await this.prisma.jobPosting.findUnique({
      where: { id, deletedAt: null },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            description: true,
            address: true,
            industry: true,
            size: true,
            foundedYear: true,
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
        interviewer: {
          select: {
            id: true,
            position: true,
            user: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`职位不存在 ID: ${id}`);
    }

    return job;
  }

  /**
   * 创建职位
   */
  async createJob(
    createJobDto: CreateJobDto,
    userId: number,
  ): Promise<JobPosting> {
    // 验证用户是否为面试官
    const interviewer = await this.prisma.interviewer.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
    });

    if (!interviewer) {
      throw new ForbiddenException('只有面试官才能创建职位');
    }

    // 验证面试官是否有权限为指定公司创建职位
    if (interviewer.companyId !== createJobDto.companyId) {
      throw new ForbiddenException('您没有权限为此公司创建职位');
    }

    // 验证行业子分类是否存在
    const subCategory = await this.prisma.industrySubCategory.findFirst({
      where: {
        id: createJobDto.subCategoryId,
        deletedAt: null,
      },
    });

    if (!subCategory) {
      throw new BadRequestException(
        `行业分类不存在 ID: ${createJobDto.subCategoryId}`,
      );
    }

    try {
      // 创建职位
      const job = await this.prisma.jobPosting.create({
        data: {
          ...createJobDto,
          interviewerId: interviewer.id,
          status: JobStatus.ACTIVE,
        },
      });

      this.logger.log(`职位创建成功 ID: ${job.id}`);

      return job;
    } catch (error) {
      this.logger.error(`创建职位失败: ${error.message}`, error);
      throw new BadRequestException('创建职位失败');
    }
  }

  /**
   * 更新职位
   */
  async updateJob(
    id: number,
    updateJobDto: UpdateJobDto,
    userId: number,
  ): Promise<JobPosting> {
    // 验证职位是否存在
    const job = await this.prisma.jobPosting.findFirst({
      where: { id, deletedAt: null },
      include: {
        interviewer: {
          select: {
            userId: true,
            companyId: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`职位不存在 ID: ${id}`);
    }

    // 验证用户是否有权限更新此职位
    if (job.interviewer.userId !== userId) {
      throw new ForbiddenException('您没有权限更新此职位');
    }

    try {
      // 更新职位
      const updatedJob = await this.prisma.jobPosting.update({
        where: { id },
        data: updateJobDto,
      });

      this.logger.log(`职位更新成功 ID: ${id}`);

      return updatedJob;
    } catch (error) {
      this.logger.error(`更新职位失败: ${error.message}`, error);
      throw new BadRequestException('更新职位失败');
    }
  }

  /**
   * 删除职位（软删除）
   */
  async deleteJob(id: number, userId: number): Promise<void> {
    // 验证职位是否存在
    const job = await this.prisma.jobPosting.findFirst({
      where: { id, deletedAt: null },
      include: {
        interviewer: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`职位不存在 ID: ${id}`);
    }

    // 验证用户是否有权限删除此职位
    if (job.interviewer.userId !== userId) {
      throw new ForbiddenException('您没有权限删除此职位');
    }

    try {
      // 软删除职位
      await this.prisma.jobPosting.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: JobStatus.EXPIRED,
        },
      });

      this.logger.log(`职位删除成功 ID: ${id}`);
    } catch (error) {
      this.logger.error(`删除职位失败: ${error.message}`, error);
      throw new BadRequestException('删除职位失败');
    }
  }
}
