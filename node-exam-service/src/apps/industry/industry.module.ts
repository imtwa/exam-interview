import { Module } from '@nestjs/common';
import { IndustryController } from './industry.controller';
import { IndustryService } from './industry.service';
import { LoggerModule } from '../../common/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '../../../prisma/generated/client';
import { LoggerService } from '../../common/logger/logger.service';

/**
 * 行业分类模块
 *
 * 处理行业分类相关功能，包括一级分类和二级分类的CRUD操作
 */
@Module({
  imports: [LoggerModule, ConfigModule],
  controllers: [IndustryController],
  providers: [
    IndustryService,
    LoggerService,
    {
      provide: 'PRISMA_CLIENT',
      useValue: new PrismaClient(),
    },
  ],
  exports: [IndustryService],
})
export class IndustryModule {}
