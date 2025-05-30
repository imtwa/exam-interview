import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaClient, Degree, Gender } from '../../../prisma/generated/client';
import { JobSeekerProfileDto } from './dto/jobseeker-profile.dto';
import { CreateEducationDto } from './dto/create-education.dto';
import { CreateWorkExperienceDto } from './dto/create-work-experience.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { UpdateWorkExperienceDto } from './dto/update-work-experience.dto';
import { UpdateJobseekerProfileDto } from './dto/update-jobseeker-profile.dto';
import { QueryJobSeekerDto } from './dto/query-jobseeker.dto';

import { UserRole } from '../../common/enums/user-role.enum';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../common/logger/logger.service';

@Injectable()
export class JobSeekerService {
  private readonly logger: LoggerService;

  constructor(
    @Inject('PRISMA_CLIENT')
    private prisma: PrismaClient,
    private configService: ConfigService,
    private loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext('JobSeekerService');
  }

  /**
   * 获取求职者资料
   * @param userId 用户ID
   * @returns 求职者资料，包括基本信息、教育经历和工作经验
   */
  async getJobSeekerProfile(userId: number) {
    this.logger.log(`获取求职者资料: ${userId}`);

    // 获取用户
    const user = await this.prisma.frontUser.findUnique({
      where: { id: userId },
      include: {
        jobSeeker: {
          include: {
            education: true,
            workExperience: true,
          },
        },
      },
    });

    if (!user) {
      this.logger.warn(`用户不存在: ${userId}`);
      throw new NotFoundException('用户不存在');
    }

    // 如果用户没有求职者资料，创建一个空的求职者资料
    if (!user.jobSeeker) {
      this.logger.log(`用户${userId}没有求职者资料，创建空资料`);
      const jobSeeker = await this.prisma.jobSeeker.create({
        data: {
          userId,
        },
        include: {
          education: true,
          workExperience: true,
        },
      });

      return {
        ...jobSeeker,
        user: {
          username: user.username,
          email: user.email,
        },
      };
    }

    const baseUrl =
      this.configService.get('APP_URL') ||
      `http://localhost:${this.configService.get('PORT') || 3000}`;
    const resumeUrl = user.jobSeeker.resumeUrl;

    return {
      ...user.jobSeeker,
      resumeUrl: `${baseUrl}/${resumeUrl.startsWith('/') ? resumeUrl.substring(1) : resumeUrl}`,
      user: {
        username: user.username,
        email: user.email,
      },
    };
  }

  /**
   * 更新求职者资料 (保留向后兼容性)
   * @param userId 用户ID
   * @param profileDto 求职者资料DTO
   * @returns 更新后的求职者资料
   */
  async updateJobSeekerProfile(
    userId: number,
    profileDto: JobSeekerProfileDto,
  ) {
    this.logger.log(`更新求职者资料: ${userId}`);

    // 检查用户是否存在
    const user = await this.prisma.frontUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`用户不存在: ${userId}`);
      throw new NotFoundException('用户不存在');
    }

    try {
      // 检查求职者是否存在，不存在则创建
      let jobSeeker = await this.prisma.jobSeeker.findFirst({
        where: { userId },
      });

      if (!jobSeeker) {
        // 创建求职者资料
        jobSeeker = await this.prisma.jobSeeker.create({
          data: {
            userId,
            ...profileDto,
            gender: profileDto.gender as Gender,
          },
          include: {
            education: true,
            workExperience: true,
          },
        });
      } else {
        // 更新求职者资料
        jobSeeker = await this.prisma.jobSeeker.update({
          where: { id: jobSeeker.id },
          data: {
            ...profileDto,
            gender: profileDto.gender as Gender,
          },
          include: {
            education: true,
            workExperience: true,
          },
        });
      }

      // 确保用户角色为求职者
      if (user.role !== UserRole.JOB_SEEKER) {
        await this.prisma.frontUser.update({
          where: { id: userId },
          data: { role: UserRole.JOB_SEEKER },
        });
      }

      this.logger.log(`更新求职者资料成功: ${userId}`);
      return jobSeeker;
    } catch (error) {
      this.logger.error(`更新求职者资料失败: ${error.message}`, error.stack);
      throw new BadRequestException('更新求职者资料失败');
    }
  }

  /**
   * 一次性同步更新求职者全部资料
   * @param userId 用户ID
   * @param profileDto 完整的求职者资料DTO
   * @returns 更新后的求职者资料
   */
  async updateJobseekerProfile(
    userId: number,
    profileDto: UpdateJobseekerProfileDto,
  ) {
    this.logger.log(
      `同步更新求职者全部资料: ${userId}，数据: ${JSON.stringify(profileDto)}`,
    );

    // 检查用户是否存在
    const user = await this.prisma.frontUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`用户不存在: ${userId}`);
      throw new NotFoundException('用户不存在');
    }

    try {
      // 使用事务确保数据一致性
      return await this.prisma.$transaction(async (prisma) => {
        // 1. 获取或创建求职者基本信息
        let jobSeeker = await prisma.jobSeeker.findFirst({
          where: { userId },
          include: {
            education: true,
            workExperience: true,
          },
        });

        // 如果求职者不存在，则创建新记录
        if (!jobSeeker) {
          // 基本信息处理
          jobSeeker = await prisma.jobSeeker.create({
            data: {
              userId,
              gender: profileDto.basic?.gender,
              birthday: profileDto.basic?.birthday,
              address: profileDto.basic?.address,
              expectedPosition: profileDto.jobIntention?.jobTitle,
              expectedWorkCity: profileDto.jobIntention?.cityName,
              currentSalary: profileDto.jobIntention?.currentSalary,
              expectedSalary: profileDto.jobIntention?.salaryMax,
              // 添加简历URL和原始文件名
              resumeUrl: profileDto.resumeUrl,
              resumeFileName: profileDto.resumeFileName,
            },
            include: {
              education: true,
              workExperience: true,
            },
          });
        } else {
          // 否则更新现有记录
          jobSeeker = await prisma.jobSeeker.update({
            where: { userId },
            data: {
              gender: profileDto.basic?.gender,
              birthday: profileDto.basic?.birthday,
              address: profileDto.basic?.address,
              expectedPosition: profileDto.jobIntention?.jobTitle,
              expectedWorkCity: profileDto.jobIntention?.cityName,
              currentSalary: profileDto.jobIntention?.currentSalary,
              expectedSalary: profileDto.jobIntention?.salaryMax,
              // 添加简历URL和原始文件名 - 如果有则更新，没有则保持原值
              ...(profileDto.resumeUrl
                ? { resumeUrl: profileDto.resumeUrl }
                : {}),
              ...(profileDto.resumeFileName
                ? { resumeFileName: profileDto.resumeFileName }
                : {}),
            },
            include: {
              education: true,
              workExperience: true,
            },
          });
        }

        // 2. 处理教育经历
        if (
          profileDto.education &&
          (profileDto.education.school ||
            profileDto.education.degree ||
            profileDto.education.major)
        ) {
          if (jobSeeker.education && jobSeeker.education.length > 0) {
            // 更新第一条教育经历
            await prisma.education.update({
              where: { id: jobSeeker.education[0].id },
              data: {
                school: profileDto.education.school,
                degree: profileDto.education.degree,
                major: profileDto.education.major,
                startDate: profileDto.education.startDate,
                endDate: profileDto.education.endDate,
              },
            });
          } else {
            // 创建新的教育经历
            await prisma.education.create({
              data: {
                jobSeekerId: jobSeeker.id,
                school: profileDto.education.school,
                degree: profileDto.education.degree,
                major: profileDto.education.major,
                startDate: profileDto.education.startDate,
                endDate: profileDto.education.endDate,
              },
            });
          }
        }

        // 3. 处理工作经历
        if (
          profileDto.experience &&
          (profileDto.experience.company || profileDto.experience.position)
        ) {
          if (jobSeeker.workExperience && jobSeeker.workExperience.length > 0) {
            // 更新第一条工作经历
            await prisma.workExperience.update({
              where: { id: jobSeeker.workExperience[0].id },
              data: {
                company: profileDto.experience.company,
                position: profileDto.experience.position,
                startDate: profileDto.experience.startDate,
                endDate: profileDto.experience.endDate,
                description: profileDto.experience.description,
              },
            });
          } else {
            // 创建新的工作经历
            await prisma.workExperience.create({
              data: {
                jobSeekerId: jobSeeker.id,
                company: profileDto.experience.company,
                position: profileDto.experience.position,
                startDate: profileDto.experience.startDate,
                endDate: profileDto.experience.endDate,
                description: profileDto.experience.description,
              },
            });
          }
        }

        // 4. 返回更新后的完整资料
        const updatedJobSeeker = await prisma.jobSeeker.findUnique({
          where: { id: jobSeeker.id },
          include: {
            education: true,
            workExperience: true,
          },
        });

        return {
          ...updatedJobSeeker,
          user: {
            username: user.username,
            email: user.email,
          },
        };
      });
    } catch (error) {
      this.logger.error(`同步更新求职者资料失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 分页获取求职者列表
   * @param query 查询参数
   * @returns 求职者列表及总数
   */
  async findAll(query: QueryJobSeekerDto) {
    const {
      page = 1,
      pageSize = 10,
      username,
      expectedPosition,
      expectedWorkCity,
    } = query;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {};

    if (username) {
      where.user = {
        username: { contains: username },
      };
    }

    if (expectedPosition) {
      where.expectedPosition = { contains: expectedPosition };
    }

    if (expectedWorkCity) {
      where.expectedWorkCity = { contains: expectedWorkCity };
    }

    try {
      const [jobSeekers, total] = await Promise.all([
        this.prisma.jobSeeker.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                username: true,
                email: true,
              },
            },
            education: true,
            workExperience: true,
          },
        }),
        this.prisma.jobSeeker.count({ where }),
      ]);

      this.logger.log(
        `查询求职者列表成功: 页码${page}, 每页${pageSize}, 总数${total}`,
      );
      return { jobSeekers, total };
    } catch (error) {
      this.logger.error(`查询求职者列表失败: ${error.message}`, error.stack);
      throw new BadRequestException('查询求职者列表失败');
    }
  }

  /**
   * 根据userID获取求职者信息
   * @param userId 求职者对应的userID
   * @returns 求职者信息
   */
  async findOne(userId: number) {
    try {
      const jobSeeker = await this.prisma.jobSeeker.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              username: true,
              email: true,
            },
          },
          education: true,
          workExperience: true,
        },
      });

      if (!jobSeeker) {
        this.logger.warn(`查询求职者失败，求职者不存在: ${userId}`);
        throw new NotFoundException('求职者不存在');
      }

      this.logger.log(`查询求职者成功: ${userId}`);
      return jobSeeker;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`查询求职者失败: ${error.message}`, error.stack);
      throw new BadRequestException('查询求职者失败');
    }
  }

  /**
   * 添加教育经历
   * @param userId 用户ID
   * @param createEducationDto 创建教育经历DTO
   * @returns 创建的教育经历
   */
  async addEducation(userId: number, createEducationDto: CreateEducationDto) {
    // 获取求职者ID
    const jobSeeker = await this.getOrCreateJobSeeker(userId);

    try {
      const education = await this.prisma.education.create({
        data: {
          jobSeekerId: jobSeeker.id,
          ...createEducationDto,
          degree: createEducationDto.degree as Degree,
        },
      });

      this.logger.log(`添加教育经历成功: ${education.id}`);
      return education;
    } catch (error) {
      this.logger.error(`添加教育经历失败: ${error.message}`, error.stack);
      throw new BadRequestException('添加教育经历失败');
    }
  }

  /**
   * 更新教育经历
   * @param id 教育经历ID
   * @param updateEducationDto 更新教育经历DTO
   * @param userId 用户ID
   * @returns 更新后的教育经历
   */
  async updateEducation(
    id: number,
    updateEducationDto: UpdateEducationDto,
    userId: number,
  ) {
    // 检查教育经历是否存在
    const education = await this.prisma.education.findUnique({
      where: { id },
      include: { jobSeeker: true },
    });

    if (!education) {
      this.logger.warn(`更新教育经历失败，教育经历不存在: ${id}`);
      throw new NotFoundException('教育经历不存在');
    }

    // 检查用户是否有权限更新该教育经历
    if (education.jobSeeker.userId !== userId) {
      this.logger.warn(`更新教育经历失败，用户无权限: ${userId}`);
      throw new ForbiddenException('无权限更新该教育经历');
    }

    try {
      const updatedEducation = await this.prisma.education.update({
        where: { id },
        data: {
          ...updateEducationDto,
          degree: updateEducationDto.degree as Degree,
        },
      });

      this.logger.log(`更新教育经历成功: ${id}`);
      return updatedEducation;
    } catch (error) {
      this.logger.error(`更新教育经历失败: ${error.message}`, error.stack);
      throw new BadRequestException('更新教育经历失败');
    }
  }

  /**
   * 删除教育经历
   * @param id 教育经历ID
   * @param userId 用户ID
   */
  async removeEducation(id: number, userId: number) {
    // 检查教育经历是否存在
    const education = await this.prisma.education.findUnique({
      where: { id },
      include: { jobSeeker: true },
    });

    if (!education) {
      this.logger.warn(`删除教育经历失败，教育经历不存在: ${id}`);
      throw new NotFoundException('教育经历不存在');
    }

    // 检查用户是否有权限删除该教育经历
    if (education.jobSeeker.userId !== userId) {
      this.logger.warn(`删除教育经历失败，用户无权限: ${userId}`);
      throw new ForbiddenException('无权限删除该教育经历');
    }

    try {
      await this.prisma.education.delete({
        where: { id },
      });

      this.logger.log(`删除教育经历成功: ${id}`);
    } catch (error) {
      this.logger.error(`删除教育经历失败: ${error.message}`, error.stack);
      throw new BadRequestException('删除教育经历失败');
    }
  }

  /**
   * 添加工作经验
   * @param userId 用户ID
   * @param createWorkExperienceDto 创建工作经验DTO
   * @returns 创建的工作经验
   */
  async addWorkExperience(
    userId: number,
    createWorkExperienceDto: CreateWorkExperienceDto,
  ) {
    // 验证数据完整性
    if (!createWorkExperienceDto.company && !createWorkExperienceDto.position) {
      this.logger.warn(`添加工作经验失败: 公司或职位不能同时为空`);
      throw new BadRequestException('公司名称或职位至少需要填写一项');
    }

    // 获取求职者ID
    const jobSeeker = await this.getOrCreateJobSeeker(userId);

    try {
      const workExperience = await this.prisma.workExperience.create({
        data: {
          jobSeekerId: jobSeeker.id,
          ...createWorkExperienceDto,
        },
      });

      this.logger.log(`添加工作经验成功: ${workExperience.id}`);
      return workExperience;
    } catch (error) {
      this.logger.error(`添加工作经验失败: ${error.message}`, error.stack);
      throw new BadRequestException(`添加工作经验失败: ${error.message}`);
    }
  }

  /**
   * 更新工作经验
   * @param id 工作经验ID
   * @param updateWorkExperienceDto 更新工作经验DTO
   * @param userId 用户ID
   * @returns 更新后的工作经验
   */
  async updateWorkExperience(
    id: number,
    updateWorkExperienceDto: UpdateWorkExperienceDto,
    userId: number,
  ) {
    // 检查工作经验是否存在
    const workExperience = await this.prisma.workExperience.findUnique({
      where: { id },
      include: { jobSeeker: true },
    });

    if (!workExperience) {
      this.logger.warn(`更新工作经验失败，工作经验不存在: ${id}`);
      throw new NotFoundException('工作经验不存在');
    }

    // 检查用户是否有权限更新该工作经验
    if (workExperience.jobSeeker.userId !== userId) {
      this.logger.warn(`更新工作经验失败，用户无权限: ${userId}`);
      throw new ForbiddenException('无权限更新该工作经验');
    }

    try {
      const updatedWorkExperience = await this.prisma.workExperience.update({
        where: { id },
        data: updateWorkExperienceDto,
      });

      this.logger.log(`更新工作经验成功: ${id}`);
      return updatedWorkExperience;
    } catch (error) {
      this.logger.error(`更新工作经验失败: ${error.message}`, error.stack);
      throw new BadRequestException('更新工作经验失败');
    }
  }

  /**
   * 删除工作经验
   * @param id 工作经验ID
   * @param userId 用户ID
   */
  async removeWorkExperience(id: number, userId: number) {
    // 检查工作经验是否存在
    const workExperience = await this.prisma.workExperience.findUnique({
      where: { id },
      include: { jobSeeker: true },
    });

    if (!workExperience) {
      this.logger.warn(`删除工作经验失败，工作经验不存在: ${id}`);
      throw new NotFoundException('工作经验不存在');
    }

    // 检查用户是否有权限删除该工作经验
    if (workExperience.jobSeeker.userId !== userId) {
      this.logger.warn(`删除工作经验失败，用户无权限: ${userId}`);
      throw new ForbiddenException('无权限删除该工作经验');
    }

    try {
      await this.prisma.workExperience.delete({
        where: { id },
      });

      this.logger.log(`删除工作经验成功: ${id}`);
    } catch (error) {
      this.logger.error(`删除工作经验失败: ${error.message}`, error.stack);
      throw new BadRequestException('删除工作经验失败');
    }
  }

  /**
   * 获取或创建求职者
   * @param userId 用户ID
   * @returns 求职者信息
   */
  private async getOrCreateJobSeeker(userId: number) {
    // 检查用户是否存在
    const user = await this.prisma.frontUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`用户不存在: ${userId}`);
      throw new NotFoundException('用户不存在');
    }

    // 检查求职者是否存在，不存在则创建
    let jobSeeker = await this.prisma.jobSeeker.findFirst({
      where: { userId },
    });

    if (!jobSeeker) {
      jobSeeker = await this.prisma.jobSeeker.create({
        data: { userId },
      });

      // 确保用户角色为求职者
      if (user.role !== UserRole.JOB_SEEKER) {
        await this.prisma.frontUser.update({
          where: { id: userId },
          data: { role: UserRole.JOB_SEEKER },
        });
      }
    }

    return jobSeeker;
  }

  /**
   * 获取求职者的职位申请列表
   * @param userId 用户ID
   * @param page 页码
   * @param pageSize 每页大小
   * @param status 申请状态，可选
   * @returns 申请列表及总数
   */
  async getUserApplications(
    userId: number,
    page: number,
    pageSize: number,
    status?: string,
  ) {
    this.logger.log(`获取用户${userId}的职位申请列表`);

    try {
      // 获取求职者信息
      const jobSeeker = await this.getOrCreateJobSeeker(userId);

      // 构建查询条件
      const where: any = {
        jobSeekerId: jobSeeker.id,
      };

      // 如果指定了状态，添加状态过滤条件
      if (status && status !== 'ALL') {
        where.status = status;
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

      return {
        items: applications,
        total,
      };
    } catch (error) {
      this.logger.error(`获取职位申请列表失败: ${error.message}`, error);
      throw error;
    }
  }
}
