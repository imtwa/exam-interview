import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { LoggerService } from '../../common/logger/logger.service';
import { PrismaClient } from '../../../prisma/generated/client';
import { LoggerModule } from '../../common/logger/logger.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    LoggerModule,
    ConfigModule,
  ],
  controllers: [JobController],
  providers: [
    JobService, 
    LoggerService,
    {
      provide: 'PRISMA_CLIENT',
      useValue: new PrismaClient(),
    }
  ],
  exports: [JobService],
})
export class JobModule {} 