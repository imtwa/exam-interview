import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  PrismaClient,
  JobStatus,
  JobApplicationStatus,
} from '../../../prisma/generated/client';
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

      this.logger.log(
        `查询参数: page=${page}, pageSize=${pageSize}, keyword=${keyword}, city=${city}, salaryMin=${salaryMin}, salaryMax=${salaryMax}, experienceReq=${experienceReq}, educationReq=${educationReq}`,
      );

      // 确保数值参数为数字类型
      const pageNum = typeof page === 'string' ? parseInt(page) : page;
      const pageSizeNum =
        typeof pageSize === 'string' ? parseInt(pageSize) : pageSize;
      const salaryMinNum =
        salaryMin && typeof salaryMin === 'string'
          ? parseInt(salaryMin)
          : salaryMin;
      const salaryMaxNum =
        salaryMax && typeof salaryMax === 'string'
          ? parseInt(salaryMax)
          : salaryMax;

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
          categoryId:
            typeof categoryId === 'string' ? parseInt(categoryId) : categoryId,
        };
      }

      // 二级分类筛选
      if (subCategoryId) {
        where.subCategoryId =
          typeof subCategoryId === 'string'
            ? parseInt(subCategoryId)
            : subCategoryId;
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
   * 获取面试官发布的职位列表
   * @param interviewerId 面试官ID
   * @param page 当前页码
   * @param pageSize 每页条数
   */
  async getInterviewerJobs(
    interviewerId: number,
    page = 1,
    pageSize = 10,
    status?: string,
  ) {
    // 首先获取面试官信息
    const interviewer = await this.prisma.interviewer.findUnique({
      where: { id: interviewerId },
      include: { company: true },
    });

    if (!interviewer) {
      throw new NotFoundException('面试官不存在');
    }

    const where: any = {
      interviewerId,
      deletedAt: null,
    };

    // 添加状态过滤条件
    if (status) {
      where.status = status;
    }

    // 计算分页
    const skip = (page - 1) * pageSize;

    try {
      // 使用Promise.all并行查询工作岗位列表和总数
      const [jobs, total] = await Promise.all([
        this.prisma.jobPosting.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            subCategory: {
              include: {
                category: true,
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

      // 处理工作岗位数据，添加申请数统计
      const items = jobs.map((job) => {
        return {
          ...job,
          category: job.subCategory?.category?.name || '未分类',
          subCategory: job.subCategory?.name || '未分类',
          applicationsCount: job._count?.applications || 0,
          companyName: interviewer.company?.name || '未知公司',
        };
      });

      return { items, total };
    } catch (error) {
      this.logger.error(
        `获取面试官工作列表失败: ${error.message}`,
        error.stack,
      );
      throw new Error('获取工作岗位列表失败');
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
    },
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

  /**
   * 申请职位
   * @param jobId 职位ID
   * @param userId 用户ID
   * @returns 申请结果
   */
  async applyForJob(jobId: number, userId: number) {
    this.logger.log(`用户 ${userId} 申请职位 ${jobId}`);

    // 1. 验证职位是否存在
    const job = await this.prisma.jobPosting.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      this.logger.error(`职位 ${jobId} 不存在`);
      throw new NotFoundException('职位不存在');
    }

    // 2. 验证职位是否处于招聘中状态
    if (job.status !== 'ACTIVE') {
      this.logger.error(`职位 ${jobId} 当前不在招聘中`);
      throw new BadRequestException('该职位当前不在招聘中');
    }

    // 3. 获取求职者信息
    const jobSeeker = await this.getJobSeekerByUserId(userId);

    // 4. 检查是否已经申请过该职位
    const existingApplication = await this.prisma.jobApplication.findFirst({
      where: {
        jobId,
        jobSeekerId: jobSeeker.id,
      },
    });

    if (existingApplication) {
      this.logger.error(`用户 ${userId} 已经申请过职位 ${jobId}`);
      throw new BadRequestException('您已经申请过该职位');
    }

    // 5. 创建申请记录 - 一键投递，无需额外字段
    const application = await this.prisma.jobApplication.create({
      data: {
        jobId,
        jobSeekerId: jobSeeker.id,
        status: 'RESUME_SCREENING',
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

    this.logger.log(`用户 ${userId} 成功申请职位 ${jobId}`);
    return application;
  }

  /**
   * 根据用户ID获取求职者信息
   * @param userId 用户ID
   * @returns 求职者信息
   */
  private async getJobSeekerByUserId(userId: number) {
    const jobSeeker = await this.prisma.jobSeeker.findFirst({
      where: { userId },
    });

    if (!jobSeeker) {
      this.logger.error(`用户 ${userId} 的求职者信息不存在`);
      throw new BadRequestException('请先完善求职者信息');
    }

    // 检查求职者是否已上传简历
    if (!jobSeeker.resumeUrl) {
      this.logger.error(`用户 ${userId} 未上传简历`);
      throw new BadRequestException('请先上传简历');
    }

    return jobSeeker;
  }

  /**
   * 获取求职者的职位申请列表
   * @param userId 用户ID
   * @param page 页码
   * @param pageSize 每页大小
   * @param status 申请状态，可选
   * @param keyword 关键词，可选
   * @param startDate 开始日期，可选
   * @param endDate 结束日期，可选
   * @returns 申请列表及总数
   */
  async getJobseekerApplications(
    userId: number,
    page: number,
    pageSize: number,
    status?: string,
    keyword?: string,
    startDate?: string,
    endDate?: string,
  ) {
    this.logger.log(`获取用户${userId}的职位申请列表`);

    try {
      // 先获取求职者信息
      const jobSeeker = await this.prisma.jobSeeker.findUnique({
        where: { userId },
      });

      if (!jobSeeker) {
        throw new NotFoundException('求职者不存在');
      }

      // 构建查询条件
      const where: any = {
        jobSeekerId: jobSeeker.id,
      };

      // 状态筛选
      if (status && status !== 'ALL') {
        where.status = status;
      }

      // 关键词搜索
      if (keyword) {
        where.OR = [
          { job: { title: { contains: keyword } } },
          { job: { company: { name: { contains: keyword } } } },
        ];
      }

      // 日期筛选
      if (startDate) {
        where.appliedAt = {
          ...(where.appliedAt || {}),
          gte: new Date(startDate),
        };
      }

      if (endDate) {
        where.appliedAt = {
          ...(where.appliedAt || {}),
          lte: new Date(`${endDate}T23:59:59`),
        };
      }

      // 查询申请总数
      const total = await this.prisma.jobApplication.count({ where });

      // 查询申请列表
      const applications = await this.prisma.jobApplication.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          appliedAt: 'desc',
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              city: true,
              salaryMin: true,
              salaryMax: true,
              company: {
                select: {
                  id: true,
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
          },
          interviews: {
            orderBy: {
              scheduleTime: 'desc',
            },
            take: 1,
          },
        },
      });

      // 格式化返回数据
      const formattedApplications = applications.map((app) => ({
        id: app.id,
        jobId: app.jobId,
        jobTitle: app.job.title,
        companyName: app.job.company.name,
        companyId: app.job.company.id,
        salary: `${app.job.salaryMin}k-${app.job.salaryMax}k`,
        city: app.job.city,
        status: app.status,
        applyDate: app.appliedAt,
        lastUpdateDate: app.updatedAt,
        feedback: app.feedback,
        categoryName: app.job.subCategory?.category?.name || null,
        subCategoryName: app.job.subCategory?.name || null,
        latestInterview:
          app.interviews.length > 0
            ? {
                scheduleTime: app.interviews[0].scheduleTime,
                status: app.interviews[0].status,
                round: app.interviews[0].round,
              }
            : null,
      }));

      return {
        items: formattedApplications,
        total,
      };
    } catch (error) {
      this.logger.error(`获取职位申请列表失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 撤回职位申请
   * @param applicationId 申请ID
   * @param userId 用户ID
   */
  async withdrawJobApplication(applicationId: number, userId: number) {
    try {
      // 先获取求职者信息
      const jobSeeker = await this.prisma.jobSeeker.findUnique({
        where: { userId },
      });

      if (!jobSeeker) {
        throw new NotFoundException('求职者不存在');
      }

      // 检查申请是否存在
      const application = await this.prisma.jobApplication.findUnique({
        where: { id: applicationId },
      });

      if (!application) {
        throw new NotFoundException('申请记录不存在');
      }

      // 检查是否是该求职者的申请
      if (application.jobSeekerId !== jobSeeker.id) {
        throw new ForbiddenException('无权限操作此申请');
      }

      // 检查申请状态是否允许撤回
      if (application.status !== JobApplicationStatus.RESUME_SCREENING) {
        throw new BadRequestException('当前状态下无法撤回申请');
      }

      // 更新申请状态为已撤回
      await this.prisma.jobApplication.update({
        where: { id: applicationId },
        data: {
          status: 'REJECTED', // 假设使用REJECTED状态表示已撤回
          feedback: '求职者已撤回申请',
        },
      });

      this.logger.log(
        `求职者ID:${jobSeeker.id}成功撤回申请ID:${applicationId}`,
      );
    } catch (error) {
      this.logger.error(`撤回申请失败: ${error.message}`, error);
      throw error;
    }
  }
}
