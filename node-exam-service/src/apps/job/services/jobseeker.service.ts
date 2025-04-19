import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '../../../../prisma/generated/client';
import { JobSeekerProfileDto } from '../dto/jobseeker-profile.dto';
import { UserRole } from '../../../common/enums/user-role.enum';

/**
 * 求职者服务 - 处理求职者资料相关的业务逻辑
 *
 * 使用Prisma进行数据库操作
 */
@Injectable()
export class JobSeekerService {
  private readonly logger = new Logger(JobSeekerService.name);

  constructor(
    @Inject('PRISMA_CLIENT')
    private prisma: PrismaClient,
  ) {}

  /**
   * 获取求职者资料
   *
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

    if (user.role !== UserRole.JOB_SEEKER) {
      this.logger.warn(`用户不是求职者: ${userId}`);
      throw new BadRequestException('用户不是求职者');
    }

    if (!user.jobSeeker) {
      this.logger.warn(`求职者资料不存在: ${userId}`);
      return {
        basic: {},
        education: [],
        workExperience: [],
      };
    }

    // 构建返回数据
    return {
      basic: {
        gender: user.jobSeeker.gender,
        birthday: user.jobSeeker.birthday,
        address: user.jobSeeker.address,
        currentSalary: user.jobSeeker.currentSalary,
        expectedSalary: user.jobSeeker.expectedSalary,
        expectedPosition: user.jobSeeker.expectedPosition,
        expectedWorkCity: user.jobSeeker.expectedWorkCity,
      },
      education: user.jobSeeker.education || [],
      workExperience: user.jobSeeker.workExperience || [],
    };
  }

  /**
   * 创建求职者资料
   *
   * @param userId 用户ID
   * @param profileDto 求职者资料DTO
   * @returns 创建的求职者资料
   */
  async createJobSeekerProfile(
    userId: number,
    profileDto: JobSeekerProfileDto,
  ) {
    this.logger.log(`创建求职者资料: ${userId}`);

    // 获取用户
    const user = await this.prisma.frontUser.findUnique({
      where: { id: userId },
      include: {
        jobSeeker: true,
      },
    });

    if (!user) {
      this.logger.warn(`用户不存在: ${userId}`);
      throw new NotFoundException('用户不存在');
    }

    if (user.role !== UserRole.JOB_SEEKER) {
      this.logger.warn(`用户不是求职者: ${userId}`);
      throw new BadRequestException('用户不是求职者');
    }

    if (user.jobSeeker) {
      this.logger.warn(`求职者资料已存在: ${userId}`);
      throw new BadRequestException('求职者资料已存在，请使用更新接口');
    }

    // 开始事务
    return await this.prisma.$transaction(async (prisma) => {
      // 创建求职者基本信息
      const jobSeeker = await prisma.jobSeeker.create({
        data: {
          userId,
          gender: profileDto.basic.gender,
          birthday: profileDto.basic.birthday,
          address: profileDto.basic.address,
          currentSalary: profileDto.jobIntention?.currentSalary,
          expectedSalary: profileDto.jobIntention?.expectedSalary,
          expectedPosition: profileDto.jobIntention?.expectedPosition,
          expectedWorkCity: profileDto.jobIntention?.expectedWorkCity,
        },
      });

      // 如果有教育经历，创建教育经历
      if (profileDto.education) {
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

      // 如果有工作经验，创建工作经验
      if (profileDto.experience) {
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

      // 返回创建的求职者资料
      return await this.getJobSeekerProfile(userId);
    });
  }

  /**
   * 更新求职者资料
   *
   * @param userId 用户ID
   * @param profileDto 求职者资料DTO
   * @returns 更新后的求职者资料
   */
  async updateJobSeekerProfile(
    userId: number,
    profileDto: JobSeekerProfileDto,
  ) {
    this.logger.log(`更新求职者资料: ${userId}`);

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

    if (user.role !== UserRole.JOB_SEEKER) {
      this.logger.warn(`用户不是求职者: ${userId}`);
      throw new BadRequestException('用户不是求职者');
    }

    // 如果求职者资料不存在，则创建
    if (!user.jobSeeker) {
      return this.createJobSeekerProfile(userId, profileDto);
    }

    // 开始事务
    return await this.prisma.$transaction(async (prisma) => {
      // 更新求职者基本信息
      await prisma.jobSeeker.update({
        where: { id: user.jobSeeker.id },
        data: {
          gender: profileDto.basic.gender,
          birthday: profileDto.basic.birthday,
          address: profileDto.basic.address,
          currentSalary: profileDto.jobIntention?.currentSalary,
          expectedSalary: profileDto.jobIntention?.expectedSalary,
          expectedPosition: profileDto.jobIntention?.expectedPosition,
          expectedWorkCity: profileDto.jobIntention?.expectedWorkCity,
        },
      });

      // 处理教育经历
      if (profileDto.education) {
        // 如果已有教育经历，则更新第一条记录
        if (user.jobSeeker.education && user.jobSeeker.education.length > 0) {
          await prisma.education.update({
            where: { id: user.jobSeeker.education[0].id },
            data: {
              school: profileDto.education.school,
              degree: profileDto.education.degree,
              major: profileDto.education.major,
              startDate: profileDto.education.startDate,
              endDate: profileDto.education.endDate,
            },
          });
        } else {
          // 否则创建新的教育经历
          await prisma.education.create({
            data: {
              jobSeekerId: user.jobSeeker.id,
              school: profileDto.education.school,
              degree: profileDto.education.degree,
              major: profileDto.education.major,
              startDate: profileDto.education.startDate,
              endDate: profileDto.education.endDate,
            },
          });
        }
      }

      // 处理工作经验
      if (profileDto.experience) {
        // 如果已有工作经验，则更新第一条记录
        if (
          user.jobSeeker.workExperience &&
          user.jobSeeker.workExperience.length > 0
        ) {
          await prisma.workExperience.update({
            where: { id: user.jobSeeker.workExperience[0].id },
            data: {
              company: profileDto.experience.company,
              position: profileDto.experience.position,
              startDate: profileDto.experience.startDate,
              endDate: profileDto.experience.endDate,
              description: profileDto.experience.description,
            },
          });
        } else {
          // 否则创建新的工作经验
          await prisma.workExperience.create({
            data: {
              jobSeekerId: user.jobSeeker.id,
              company: profileDto.experience.company,
              position: profileDto.experience.position,
              startDate: profileDto.experience.startDate,
              endDate: profileDto.experience.endDate,
              description: profileDto.experience.description,
            },
          });
        }
      }

      // 返回更新后的求职者资料
      return await this.getJobSeekerProfile(userId);
    });
  }
}
