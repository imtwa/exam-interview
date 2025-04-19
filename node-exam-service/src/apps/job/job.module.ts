import { Module } from '@nestjs/common';
import { LoggerModule } from '../../common/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '../../../prisma/generated/client';
import { LoggerService } from '../../common/logger/logger.service';

// Controllers
import { InterviewerController } from '../interviewer/interviewer.controller';
import { JobSeekerController } from './controllers/jobseeker.controller';

// Services
import { JobService } from './services/job.service';
import { InterviewerService } from './services/interviewer.service';
import { JobSeekerService } from './services/jobseeker.service';

@Module({
  imports: [LoggerModule, ConfigModule],
  controllers: [InterviewerController, JobSeekerController],
  providers: [
    JobService,
    InterviewerService,
    JobSeekerService,
    LoggerService,
    {
      provide: 'PRISMA_CLIENT',
      useValue: new PrismaClient(),
    },
  ],
  exports: [JobService, InterviewerService, JobSeekerService],
})
export class JobModule {}
