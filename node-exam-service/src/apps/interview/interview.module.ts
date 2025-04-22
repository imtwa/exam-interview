import { Module } from '@nestjs/common';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { LoggerModule } from '../../common/logger/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [InterviewController],
  providers: [InterviewService],
  exports: [InterviewService],
})
export class InterviewModule {}
