import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaClient, JobStatus } from '../../../prisma/generated/client';
import { LoggerService } from '../../common/logger/logger.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { QueryJobDto, JobSortField } from './dto/query-job.dto';

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
   * 创建招聘信息
   * @param createJobDto 创建招聘信息DTO
   * @param userId 用户ID
   * @returns 创建的招聘信息
   */
  async create(createJobDto: CreateJobPostingDto, userId: number) {
    try {
      // 验证用户是否为面试官
      const interviewer = await this.prisma.interviewer.findUnique({
        where: { userId, deletedAt: null },
      });

      if (!interviewer) {
        throw new ForbiddenException('只有面试官才能发布职位');
      }

      // 验证公司是否存在
      const company = await this.prisma.company.findUnique({
        where: { id: createJobDto.companyId, deletedAt: null },
      });

      if (!company) {
        throw new NotFoundException(`公司ID:${createJobDto.companyId}不存在`);
      }

      // 验证公司是否已验证
      if (company.verificationStatus !== 'VERIFIED') {
        throw new BadRequestException('公司未通过验证，无法发布职位');
      }

      // 验证面试官是否属于该公司
      if (interviewer.companyId !== createJobDto.companyId) {
        throw new ForbiddenException('您只能为您所在的公司发布职位');
      }

      // 验证二级分类是否存在
      const subCategory = await this.prisma.industrySubCategory.findUnique({
        where: { id: createJobDto.subCategoryId, deletedAt: null },
      });

      if (!subCategory) {
        throw new NotFoundException(
          `行业二级分类ID:${createJobDto.subCategoryId}不存在`,
        );
      }

      // 检查薪资范围是否合理
      if (createJobDto.salaryMin > createJobDto.salaryMax) {
        throw new BadRequestException('薪资下限不能大于薪资上限');
      }

      // 创建职位
      const job = await this.prisma.jobPosting.create({
        data: {
          title: createJobDto.title,
          companyId: createJobDto.companyId,
          interviewerId: interviewer.id,
          subCategoryId: createJobDto.subCategoryId,
          description: createJobDto.description,
          requirements: createJobDto.requirements,
          city: createJobDto.city,
          address: createJobDto.address,
          salaryMin: createJobDto.salaryMin,
          salaryMax: createJobDto.salaryMax,
          experienceReq: createJobDto.experienceReq,
          educationReq: createJobDto.educationReq,
          isRemote: createJobDto.isRemote || false,
          status: JobStatus.ACTIVE,
        },
        include: {
          company: {
            select: {
              name: true,
              size: true,
              fundingStage: true,
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
        },
      });

      return job;
    } catch (error) {
      this.logger.error(`创建招聘信息失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 更新招聘信息
   * @param id 招聘信息ID
   * @param updateJobDto 更新招聘信息DTO
   * @param userId 用户ID
   * @returns 更新后的招聘信息
   */
  async update(id: number, updateJobDto: UpdateJobPostingDto, userId: number) {
    try {
      // 验证职位是否存在
      const existingJob = await this.prisma.jobPosting.findUnique({
        where: { id, deletedAt: null },
        include: {
          interviewer: true,
        },
      });

      if (!existingJob) {
        throw new NotFoundException(`职位ID:${id}不存在`);
      }

      // 验证用户是否为职位发布者
      const interviewer = await this.prisma.interviewer.findUnique({
        where: { userId, deletedAt: null },
      });

      if (!interviewer) {
        throw new ForbiddenException('只有面试官才能更新职位');
      }

      if (existingJob.interviewer.userId !== userId) {
        throw new ForbiddenException('您只能更新自己发布的职位');
      }

      // 如果更新了公司ID，验证是否合法
      if (
        updateJobDto.companyId &&
        updateJobDto.companyId !== existingJob.companyId
      ) {
        throw new BadRequestException('不能更改职位所属公司');
      }

      // 如果更新了二级分类，验证是否存在
      if (
        updateJobDto.subCategoryId &&
        updateJobDto.subCategoryId !== existingJob.subCategoryId
      ) {
        const subCategory = await this.prisma.industrySubCategory.findUnique({
          where: { id: updateJobDto.subCategoryId, deletedAt: null },
        });

        if (!subCategory) {
          throw new NotFoundException(
            `行业二级分类ID:${updateJobDto.subCategoryId}不存在`,
          );
        }
      }

      // 如果更新了薪资范围，验证是否合理
      const salaryMin =
        updateJobDto.salaryMin !== undefined
          ? updateJobDto.salaryMin
          : existingJob.salaryMin;
      const salaryMax =
        updateJobDto.salaryMax !== undefined
          ? updateJobDto.salaryMax
          : existingJob.salaryMax;

      if (salaryMin > salaryMax) {
        throw new BadRequestException('薪资下限不能大于薪资上限');
      }

      // 更新职位（多字段更新）
      const job = await this.prisma.jobPosting.update({
        where: { id },
        data: {
          ...updateJobDto,
          updatedAt: new Date(),
        },
        include: {
          company: {
            select: {
              name: true,
              size: true,
              fundingStage: true,
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
        },
      });

      return job;
    } catch (error) {
      this.logger.error(`更新招聘信息失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 删除招聘信息
   * @param id 招聘信息ID
   * @param userId 用户ID
   */
  async remove(id: number, userId: number) {
    try {
      // 验证职位是否存在
      const existingJob = await this.prisma.jobPosting.findUnique({
        where: { id, deletedAt: null },
        include: {
          interviewer: true,
        },
      });

      if (!existingJob) {
        throw new NotFoundException(`职位ID:${id}不存在`);
      }

      // 验证用户是否为职位发布者
      const interviewer = await this.prisma.interviewer.findUnique({
        where: { userId, deletedAt: null },
      });

      if (!interviewer) {
        throw new ForbiddenException('只有面试官才能删除职位');
      }

      if (existingJob.interviewer.userId !== userId) {
        throw new ForbiddenException('您只能删除自己发布的职位');
      }

      // 检查是否有申请记录
      const hasApplications = await this.prisma.jobApplication.count({
        where: { jobId: id },
      });

      if (hasApplications > 0) {
        throw new BadRequestException(
          `该职位已有${hasApplications}份申请，无法删除`,
        );
      }

      // 如果没有申请记录，可以软删除
      await this.prisma.jobPosting.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`删除招聘信息失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 获取单个招聘信息
   * @param id 招聘信息ID
   * @returns 招聘信息详情
   */
  async findOne(id: number) {
    try {
      // 查询职位详情
      const job = await this.prisma.jobPosting.findUnique({
        where: { id, deletedAt: null },
        include: {
          company: {
            select: {
              name: true,
              size: true,
              fundingStage: true,
            },
          },
          interviewer: {
            select: {
              id: true,
              position: true,
              user: {
                select: {
                  username: true,
                },
              },
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
          _count: {
            select: {
              applications: true,
            },
          },
        },
      });

      if (!job) {
        throw new NotFoundException(`职位ID:${id}不存在`);
      }

      // 统计申请数
      const applicationsCount = job._count?.applications || 0;
      const result = {
        ...job,
        applicationsCount,
      };

      return result;
    } catch (error) {
      this.logger.error(`获取招聘信息详情失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 获取招聘信息列表
   * @param query 查询参数
   * @returns 分页招聘信息列表
   */
  async findAll(query: QueryJobDto) {
    try {
      const {
        page = 1,
        pageSize = 10,
        keyword,
        companyId,
        city,
        salaryMin,
        salaryMax,
        categoryId,
        subCategoryId,
        experienceReq,
        educationReq,
        sortField = JobSortField.CREATED_AT,
        sortOrder = 'desc',
      } = query;

      this.logger.log(`查询参数: page=${page}, pageSize=${pageSize}, keyword=${keyword}, city=${city}, salaryMin=${salaryMin}, salaryMax=${salaryMax}, experienceReq=${experienceReq}, educationReq=${educationReq}`);

      // 确保数值参数为数字类型
      const pageNum = typeof page === 'string' ? parseInt(page) : page;
      const pageSizeNum = typeof pageSize === 'string' ? parseInt(pageSize) : pageSize;
      const salaryMinNum = salaryMin && typeof salaryMin === 'string' ? parseInt(salaryMin) : salaryMin;
      const salaryMaxNum = salaryMax && typeof salaryMax === 'string' ? parseInt(salaryMax) : salaryMax;
      
      const skip = (pageNum - 1) * pageSizeNum;

      // 构建查询条件
      const where: any = {
        deletedAt: null,
        status: JobStatus.ACTIVE,
      };

      // 关键词搜索
      if (keyword) {
        where.OR = [
          { title: { contains: keyword } },
          { description: { contains: keyword } },
          { requirements: { contains: keyword } },
          { company: { name: { contains: keyword } } },
        ];
      }

      // 公司筛选
      if (companyId) {
        where.companyId = parseInt(companyId as any);
      }

      // 城市筛选
      if (city) {
        where.city = { contains: city }; // 使用模糊查询而不是完全匹配
      }

      // 薪资范围筛选
      if (salaryMinNum) {
        where.salaryMax = { gte: salaryMinNum }; // 最高薪资不小于最低要求
      }

      if (salaryMaxNum) {
        where.salaryMin = { lte: salaryMaxNum }; // 最低薪资不大于最高要求
      }

      // 工作经验筛选
      if (experienceReq) {
        where.experienceReq = experienceReq;
      }

      // 学历要求筛选
      if (educationReq) {
        where.educationReq = educationReq;
      }

      // 一级分类筛选
      if (categoryId) {
        where.subCategory = {
          categoryId: typeof categoryId === 'string' ? parseInt(categoryId) : categoryId,
        };
      }

      // 二级分类筛选
      if (subCategoryId) {
        where.subCategoryId = typeof subCategoryId === 'string' ? parseInt(subCategoryId) : subCategoryId;
      }

      // 构建排序条件
      let orderBy: any;
      if (sortField === JobSortField.SALARY) {
        orderBy = {
          salaryMax: sortOrder,
        };
      } else {
        orderBy = {
          createdAt: sortOrder,
        };
      }

      const [jobs, total] = await Promise.all([
        this.prisma.jobPosting.findMany({
          where,
          skip,
          take: pageSizeNum,
          orderBy,
          include: {
            company: {
              select: {
                name: true,
                size: true,
                fundingStage: true,
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
        }),
        this.prisma.jobPosting.count({ where }),
      ]);

      // 处理结果
      const jobList = jobs.map((job) => {
        return {
          ...job,
          applicationsCount: job._count?.applications || 0,
        };
      });

      this.logger.log(`查询到 ${total} 条记录，返回 ${jobs.length} 条数据`);
      
      return { jobs: jobList, total };
    } catch (error) {
      this.logger.error(`获取招聘信息列表失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 获取热门城市列表
   * @returns 热门城市列表
   */
  async getHotCities() {
    try {
      // 获取职位数量最多的前10个城市
      const cities = await this.prisma.jobPosting.groupBy({
        by: ['city'],
        where: {
          deletedAt: null,
          status: JobStatus.ACTIVE,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 10,
      });

      return cities.map((item) => ({
        name: item.city,
        count: item._count.id,
      }));
    } catch (error) {
      this.logger.error(`获取热门城市列表失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 获取面试官发布的职位列表
   * @param userId 用户ID
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 职位列表
   */
  async getInterviewerJobs(userId: number, page: number, pageSize: number) {
    try {
      const skip = (page - 1) * pageSize;

      // 获取用户的面试官信息
      const interviewer = await this.prisma.interviewer.findUnique({
        where: { userId, deletedAt: null },
      });

      if (!interviewer) {
        throw new ForbiddenException('用户不是面试官');
      }

      const [jobs, total] = await Promise.all([
        this.prisma.jobPosting.findMany({
          where: {
            interviewer: { userId },
            deletedAt: null,
          },
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            company: {
              select: {
                name: true,
              },
            },
            subCategory: {
              select: {
                name: true,
              },
            },
            _count: {
              select: {
                applications: true,
              },
            },
          },
        }),
        this.prisma.jobPosting.count({
          where: {
            interviewer: { userId },
            deletedAt: null,
          },
        }),
      ]);

      // 处理结果
      const jobList = jobs.map((job) => {
        return {
          ...job,
          applicationsCount: job._count?.applications || 0,
        };
      });

      return { items: jobList, total };
    } catch (error) {
      this.logger.error(
        `获取面试官发布的职位列表失败: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 根据用户ID获取面试官信息
   * @param userId 用户ID
   * @returns 面试官信息
   */
  async getInterviewerByUserId(userId: number) {
    const interviewer = await this.prisma.interviewer.findUnique({
      where: { userId, deletedAt: null },
    });

    if (!interviewer) {
      throw new ForbiddenException('用户不是面试官');
    }

    return interviewer;
  }

  /**
   * 获取面试官发布的职位列表(带筛选条件)
   * @param interviewerId 面试官ID
   * @param query 查询参数
   * @returns 职位列表及总数
   */
  async getInterviewerJobsWithFilter(
    interviewerId: number,
    query: {
      page?: number;
      pageSize?: number;
      keyword?: string;
      status?: string;
      sortField?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    try {
      const {
        page = 1,
        pageSize = 10,
        keyword,
        status,
        sortField = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const skip = (page - 1) * pageSize;

      // 构建查询条件
      const where: any = {
        interviewerId,
        deletedAt: null,
      };

      // 状态筛选
      if (status) {
        where.status = status;
      }

      // 关键词搜索
      if (keyword) {
        where.OR = [
          { title: { contains: keyword } },
          { description: { contains: keyword } },
          { requirements: { contains: keyword } },
        ];
      }

      // 构建排序条件
      let orderBy: any;
      if (sortField === 'salary') {
        orderBy = {
          salaryMax: sortOrder,
        };
      } else {
        orderBy = {
          createdAt: sortOrder,
        };
      }

      const [jobs, total] = await Promise.all([
        this.prisma.jobPosting.findMany({
          where,
          skip,
          take: pageSize,
          orderBy,
          include: {
            company: {
              select: {
                name: true,
                size: true,
                fundingStage: true,
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
        }),
        this.prisma.jobPosting.count({ where }),
      ]);

      // 处理结果
      const jobList = jobs.map((job) => {
        return {
          ...job,
          applicationsCount: job._count?.applications || 0,
        };
      });

      return { jobs: jobList, total };
    } catch (error) {
      this.logger.error(`获取面试官职位列表失败: ${error.message}`, error);
      throw error;
    }
  }
}
