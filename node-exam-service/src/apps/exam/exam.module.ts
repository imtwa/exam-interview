import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { LoggerService } from '../../common/logger/logger.service';
import { PrismaClient } from '../../../prisma/generated/client';
import { LoggerModule } from '../../common/logger/logger.module';

@Module({
  imports: [
    LoggerModule,
    MulterModule.register({
      dest: './uploads/exams',
    }),
  ],
  controllers: [ExamController],
  providers: [
    ExamService, 
    {
      provide: 'PRISMA_CLIENT',
      useValue: new PrismaClient(),
    }
  ],
  exports: [ExamService],
})
export class ExamModule {} 