import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../common/logger/logger.service';
import { PrismaClient } from '../../../prisma/generated/client';

// 定义简历数据接口
interface ResumeData {
  path: string; // 文件相对路径
  originalName: string; // 原始文件名
}

@Injectable()
export class UploadService {
  private readonly logger: LoggerService;

  constructor(
    private configService: ConfigService,
    @Inject('PRISMA_CLIENT')
    private prisma: PrismaClient,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext('UploadService');
  }

  /**
   * 更新求职者简历信息
   * @param userId 用户ID
   * @param resumeData 简历数据（包含路径和原始文件名）
   * @returns 更新后的求职者信息
   */
  async updateJobSeekerResume(userId: number, resumeData: ResumeData) {
    try {
      // 查找或创建求职者记录
      let jobSeeker = await this.prisma.jobSeeker.findUnique({
        where: { userId },
      });

      const updateData = {
        resumeUrl: resumeData.path,
        resumeFileName: resumeData.originalName,
      };

      if (!jobSeeker) {
        // 如果求职者记录不存在，创建新记录
        jobSeeker = await this.prisma.jobSeeker.create({
          data: {
            userId,
            ...updateData,
          },
          include: {
            education: true,
            workExperience: true,
          },
        });
      } else {
        // 更新现有记录的简历URL和文件名
        jobSeeker = await this.prisma.jobSeeker.update({
          where: { userId },
          data: updateData,
          include: {
            education: true,
            workExperience: true,
          },
        });
      }

      return jobSeeker;
    } catch (error) {
      this.logger.error(`更新求职者简历失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 获取上传文件的完整URL
   * @param relativePath 相对路径
   * @returns 完整的文件URL
   */
  getFileUrl(relativePath: string): string {
    const baseUrl =
      this.configService.get('APP_URL') || 'http://localhost:3000';
    return `${baseUrl}/${relativePath}`;
  }
}
