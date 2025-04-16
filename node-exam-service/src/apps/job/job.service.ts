import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
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
   */
  async getJobList(queryJobDto: QueryJobDto) {
    const { page = 1, pageSize = 10, keyword, companyId, subCategoryId, city, salaryMin, salaryMax } = queryJobDto;
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

    this.logger.log(`获取职位列表：page=${page}, pageSize=${pageSize}, total=${total}`);
    
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
   */
  async createJob(createJobDto: CreateJobDto) {
    // 检查面试官
    const interviewer = await this.prisma.interviewer.findUnique({
      where: { id: createJobDto.interviewerId },
    });

    if (!interviewer) {
      this.logger.warn(`创建职位失败: 面试官不存在 ${createJobDto.interviewerId}`);
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
      this.logger.warn(`创建职位失败: 面试官不属于该公司 ${createJobDto.interviewerId}/${createJobDto.companyId}`);
      throw new BadRequestException('面试官不属于该公司');
    }

    // 检查行业分类
    const subCategory = await this.prisma.industrySubCategory.findUnique({
      where: { id: createJobDto.subCategoryId },
    });

    if (!subCategory) {
      this.logger.warn(`创建职位失败: 行业分类不存在 ${createJobDto.subCategoryId}`);
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
        this.logger.warn(`更新职位失败: 面试官不存在 ${updateJobDto.interviewerId}`);
        throw new BadRequestException('面试官不存在');
      }

      const companyId = updateJobDto.companyId || job.companyId;
      if (interviewer.companyId !== companyId) {
        this.logger.warn(`更新职位失败: 面试官不属于该公司 ${updateJobDto.interviewerId}/${companyId}`);
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
        this.logger.warn(`更新职位失败: 行业分类不存在 ${updateJobDto.subCategoryId}`);
        throw new BadRequestException('行业分类不存在');
      }
    }

    // 更新职位
    const updatedJob = await this.prisma.jobPosting.update({
      where: { id },
      data: updateJobDto,
    });

    this.logger.log(`更新职位成功: ${id}, 标题: ${updatedJob.title}`);
    return updatedJob;
  }

  /**
   * 删除职位（软删除）
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

    // 软删除
    const deletedJob = await this.prisma.jobPosting.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: JobStatus.EXPIRED,
      },
    });

    this.logger.log(`删除职位成功: ${id}, 标题: ${deletedJob.title}`);
    return { success: true, message: '职位已删除' };
  }

  /**
   * 检查用户是否为HR且是否需要完善信息
   */
  async checkUserProfile(userId: number) {
    // 获取用户信息
    const user = await this.prisma.frontUser.findUnique({
      where: { id: userId },
      include: {
        interviewer: true,
      },
    });

    if (!user) {
      this.logger.warn(`用户不存在: ${userId}`);
      throw new NotFoundException('用户不存在');
    }

    // 检查用户角色
    if (user.role !== UserRole.INTERVIEWER) {
      this.logger.warn(`用户不是HR: ${userId}, 角色: ${user.role}`);
      throw new ForbiddenException('只有HR角色可以访问此功能');
    }

    // 检查是否需要完善信息
    const needsProfileSetup = !user.interviewer;

    // 返回结果，移除了公司列表
    return {
      needsProfileSetup,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      interviewer: user.interviewer
    };
  }

  /**
   * 创建公司
   */
  async createCompany(createCompanyDto: CreateCompanyDto, userId: number) {
    const { name } = createCompanyDto;

    // 检查公司名称是否已存在
    const existingCompany = await this.prisma.company.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });

    if (existingCompany) {
      this.logger.warn(`公司名称已存在: ${name}`);
      throw new BadRequestException('公司名称已存在');
    }

    // 检查用户是否存在
    const user = await this.prisma.frontUser.findUnique({
      where: { id: userId },
      include: {
        interviewer: true,
      },
    });

    if (!user) {
      this.logger.warn(`用户不存在: ${userId}`);
      throw new NotFoundException('用户不存在');
    }

    if (user.role !== UserRole.INTERVIEWER) {
      this.logger.warn(`用户不是HR: ${userId}, 角色: ${user.role}`);
      throw new ForbiddenException('只有HR角色可以创建公司');
    }

    // 创建公司
    const company = await this.prisma.company.create({
      data: createCompanyDto,
    });

    // 如果用户已有面试官信息，则更新关联的公司ID
    if (user.interviewer) {
      await this.prisma.interviewer.update({
        where: { id: user.interviewer.id },
        data: {
          companyId: company.id,
        },
      });
      this.logger.log(`已将面试官(${user.interviewer.id})关联到新创建的公司(${company.id})`);
    } else {
      // 如果用户还没有面试官信息，则创建一个基本的面试官信息
      await this.prisma.interviewer.create({
        data: {
          userId: user.id,
          companyId: company.id,
          position: 'HR', // 默认职位
        },
      });
      this.logger.log(`为用户(${userId})创建了基本的面试官信息并关联到新公司(${company.id})`);
    }

    this.logger.log(`创建公司成功: ${company.id}, 名称: ${company.name}`);
    return company;
  }

  /**
   * 根据用户ID获取公司信息
   */
  async getCompanyByUserId(userId: number) {
    // 检查用户是否存在
    const user = await this.prisma.frontUser.findUnique({
      where: { id: userId },
      include: {
        interviewer: true,
      },
    });

    if (!user) {
      this.logger.warn(`用户不存在: ${userId}`);
      throw new NotFoundException('用户不存在');
    }

    if (user.role !== UserRole.INTERVIEWER) {
      this.logger.warn(`用户不是HR: ${userId}, 角色: ${user.role}`);
      throw new ForbiddenException('只有HR角色可以查看公司信息');
    }

    // 检查用户是否已有关联的面试官信息
    if (!user.interviewer) {
      this.logger.warn(`用户未设置面试官信息: ${userId}`);
      throw new NotFoundException('您尚未完善个人信息');
    }

    // 获取公司信息
    const company = await this.prisma.company.findUnique({
      where: { id: user.interviewer.companyId },
    });

    if (!company) {
      this.logger.warn(`公司不存在: ${user.interviewer.companyId}`);
      throw new NotFoundException('公司不存在');
    }

    return company;
  }

  /**
   * 更新公司信息
   */
  async updateCompany(userId: number, updateCompanyDto: CreateCompanyDto) {
    // 获取用户的公司信息
    const user = await this.prisma.frontUser.findUnique({
      where: { id: userId },
      include: {
        interviewer: true,
      },
    });

    if (!user) {
      this.logger.warn(`用户不存在: ${userId}`);
      throw new NotFoundException('用户不存在');
    }

    if (user.role !== UserRole.INTERVIEWER) {
      this.logger.warn(`用户不是HR: ${userId}, 角色: ${user.role}`);
      throw new ForbiddenException('只有HR角色可以更新公司信息');
    }

    if (!user.interviewer) {
      this.logger.warn(`用户未设置面试官信息: ${userId}`);
      throw new NotFoundException('您尚未完善个人信息');
    }

    const companyId = user.interviewer.companyId;

    // 检查公司是否存在
    const existingCompany = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!existingCompany) {
      this.logger.warn(`公司不存在: ${companyId}`);
      throw new NotFoundException('公司不存在');
    }

    // 如果修改了公司名称，检查新名称是否已存在
    if (updateCompanyDto.name && updateCompanyDto.name !== existingCompany.name) {
      const nameExists = await this.prisma.company.findFirst({
        where: {
          name: updateCompanyDto.name,
          id: { not: companyId },
          deletedAt: null,
        },
      });

      if (nameExists) {
        this.logger.warn(`公司名称已存在: ${updateCompanyDto.name}`);
        throw new BadRequestException('公司名称已存在');
      }
    }

    // 更新公司信息
    const updatedCompany = await this.prisma.company.update({
      where: { id: companyId },
      data: updateCompanyDto,
    });

    this.logger.log(`更新公司信息成功: ${updatedCompany.id}, 名称: ${updatedCompany.name}`);
    return updatedCompany;
  }

  /**
   * 创建或更新面试官信息
   */
  async createOrUpdateInterviewer(userId: number, createInterviewerDto: CreateInterviewerDto, companyId: number) {
    // 检查用户
    const user = await this.prisma.frontUser.findUnique({
      where: { id: userId },
      include: {
        interviewer: true,
      },
    });

    if (!user) {
      this.logger.warn(`用户不存在: ${userId}`);
      throw new NotFoundException('用户不存在');
    }

    if (user.role !== UserRole.INTERVIEWER) {
      this.logger.warn(`用户不是HR: ${userId}, 角色: ${user.role}`);
      throw new ForbiddenException('只有HR角色可以完善面试官信息');
    }

    // 检查公司是否存在
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      this.logger.warn(`公司不存在: ${companyId}`);
      throw new NotFoundException('公司不存在');
    }

    let interviewer;
    
    if (user.interviewer) {
      // 更新现有面试官信息
      interviewer = await this.prisma.interviewer.update({
        where: { id: user.interviewer.id },
        data: {
          ...createInterviewerDto,
          companyId,
        },
      });
      this.logger.log(`更新面试官信息成功: ${interviewer.id}, 姓名: ${interviewer.name}`);
    } else {
      // 创建新的面试官信息
      interviewer = await this.prisma.interviewer.create({
        data: {
          ...createInterviewerDto,
          userId,
          companyId,
        },
      });
      this.logger.log(`创建面试官信息成功: ${interviewer.id}, 姓名: ${interviewer.name}`);
    }

    return interviewer;
  }

  /**
   * 设置HR个人资料和公司信息
   */
  async setupProfile(userId: number, profileSetupDto: ProfileSetupDto) {
    const { interviewer: interviewerDto, company: companyDto, useExistingCompany, existingCompanyId } = profileSetupDto;
    
    // 开始事务
    return this.prisma.$transaction(async (prisma) => {
      let companyId: number;
      
      if (useExistingCompany && existingCompanyId) {
        // 使用现有公司
        const existingCompany = await prisma.company.findUnique({
          where: { id: existingCompanyId },
        });
        
        if (!existingCompany) {
          throw new NotFoundException('选择的公司不存在');
        }
        
        companyId = existingCompanyId;
        this.logger.log(`使用现有公司: ${companyId}, 名称: ${existingCompany.name}`);
      } else {
        // 创建新公司
        const newCompany = await prisma.company.create({
          data: companyDto,
        });
        
        companyId = newCompany.id;
        this.logger.log(`创建新公司: ${companyId}, 名称: ${newCompany.name}`);
      }
      
      // 创建或更新面试官信息
      const user = await prisma.frontUser.findUnique({
        where: { id: userId },
        include: {
          interviewer: true,
        },
      });
      
      if (!user) {
        throw new NotFoundException('用户不存在');
      }
      
      if (user.role !== UserRole.INTERVIEWER) {
        throw new ForbiddenException('只有HR角色可以完善个人信息');
      }
      
      let interviewer;
      
      if (user.interviewer) {
        // 更新现有面试官信息
        interviewer = await prisma.interviewer.update({
          where: { id: user.interviewer.id },
          data: {
            ...interviewerDto,
            companyId,
          },
        });
      } else {
        // 创建新的面试官信息
        interviewer = await prisma.interviewer.create({
          data: {
            ...interviewerDto,
            userId,
            companyId,
          },
        });
      }
      
      this.logger.log(`面试官设置完成: ${interviewer.id}, 姓名: ${interviewer.name}, 公司ID: ${companyId}`);
      
      return {
        success: true,
        interviewer,
        company: await prisma.company.findUnique({
          where: { id: companyId },
        }),
      };
    });
  }
  
  /**
   * 获取行业分类数据（用于公司选择行业）
   */
  async getIndustryCategories() {
    const categories = await this.prisma.industryCategory.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        subCategories: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    return categories;
  }

  /**
   * 获取公司列表（支持搜索）
   */
  async getCompanies(params: { 
    keyword?: string; 
    page?: number; 
    pageSize?: number;
    industry?: string;
  }) {
    const { keyword, page = 1, pageSize = 10, industry } = params;
    const skip = (page - 1) * pageSize;
    
    // 构建查询条件
    const where = {
      deletedAt: null, // 只查询未删除的记录
      ...(keyword && {
        OR: [
          { name: { contains: keyword } },
          { description: { contains: keyword } },
          { address: { contains: keyword } },
        ],
      }),
      ...(industry && { industry: { contains: industry } }),
    };

    // 查询总数
    const total = await this.prisma.company.count({ where });
    
    // 查询数据
    const list = await this.prisma.company.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        industry: true,
        size: true,
        address: true,
        description: true,
        foundedYear: true,
        fundingStage: true,
      },
    });

    this.logger.log(`获取公司列表：page=${page}, pageSize=${pageSize}, total=${total}`);
    
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
} 