import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { LoggerModule } from '../../common/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '../../../prisma/generated/client';
import { LoggerService } from '../../common/logger/logger.service';

/**
 * 招聘信息模块
 *
 * 处理招聘相关功能，包括职位发布、查询等
 */
@Module({
  imports: [LoggerModule, ConfigModule],
  controllers: [JobController],
  providers: [
    JobService,
    LoggerService,
    {
      provide: 'PRISMA_CLIENT',
      useValue: new PrismaClient(),
    },
  ],
  exports: [JobService],
})
export class JobModule {}
