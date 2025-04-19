import { Module } from '@nestjs/common';
import { LoggerModule } from '../../common/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '../../../prisma/generated/client';
import { LoggerService } from '../../common/logger/logger.service';
import { InterviewerController } from './interviewer.controller';
import { InterviewerService } from './interviewer.service';

/**
 * 面试官模块
 * 
 * 处理面试官相关的功能，包括面试官资料管理、职位管理等
 */
@Module({
  imports: [LoggerModule, ConfigModule],
  controllers: [InterviewerController],
  providers: [
    InterviewerService,
    LoggerService,
    {
      provide: 'PRISMA_CLIENT',
      useValue: new PrismaClient(),
    },
  ],
  exports: [InterviewerService],
})
export class InterviewerModule {}