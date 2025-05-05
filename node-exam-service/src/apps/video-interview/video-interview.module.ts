import { Module } from '@nestjs/common';
import { VideoInterviewController } from './video-interview.controller';
import { VideoInterviewService } from './video-interview.service';
import { PrismaClient } from '../../../prisma/generated/client';
import { LoggerService } from '../../common/logger/logger.service';

@Module({
  controllers: [VideoInterviewController],
  providers: [
    VideoInterviewService,
    {
      provide: 'PRISMA_CLIENT',
      useValue: new PrismaClient(),
    },
    LoggerService,
  ],
  exports: [VideoInterviewService],
})
export class VideoInterviewModule {}
