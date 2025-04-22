import { Module } from '@nestjs/common';
import { LoggerModule } from '../../common/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '../../../prisma/generated/client';
import { LoggerService } from '../../common/logger/logger.service';
import { JobSeekerController } from './jobseeker.controller';
import { JobSeekerService } from './jobseeker.service';

/**
 * 求职者模块
 *
 * 处理求职者相关的功能，包括个人资料管理、教育经历、工作经验等
 */
@Module({
  imports: [LoggerModule, ConfigModule],
  controllers: [JobSeekerController],
  providers: [
    JobSeekerService,
    LoggerService,
    {
      provide: 'PRISMA_CLIENT',
      useValue: new PrismaClient(),
    },
  ],
  exports: [JobSeekerService],
})
export class JobSeekerModule {}
