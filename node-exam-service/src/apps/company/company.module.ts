import { Module } from '@nestjs/common';
import { LoggerModule } from '../../common/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '../../../prisma/generated/client';
import { LoggerService } from '../../common/logger/logger.service';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

/**
 * 公司模块
 *
 * 处理公司相关的功能，包括公司信息管理、验证等
 */
@Module({
  imports: [LoggerModule, ConfigModule],
  controllers: [CompanyController],
  providers: [
    CompanyService,
    LoggerService,
    {
      provide: 'PRISMA_CLIENT',
      useValue: new PrismaClient(),
    },
  ],
  exports: [CompanyService],
})
export class CompanyModule {}
