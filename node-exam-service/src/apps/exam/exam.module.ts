import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { LoggerService } from '../../common/logger/logger.service';
import { PrismaClient } from '../../../prisma/generated/client';
import { LoggerModule } from '../../common/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import * as multer from 'multer';
import * as path from 'path';

@Module({
  imports: [
    LoggerModule,
    ConfigModule,
    MulterModule.register({
      dest: './uploads/exams',
      preservePath: true,
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, './uploads/exams');
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname) || '.xlsx';
          cb(null, `temp-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const acceptedTypes = [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/octet-stream',
        ];

        if (
          acceptedTypes.includes(file.mimetype) ||
          file.originalname.endsWith('.xlsx') ||
          file.originalname.endsWith('.xls')
        ) {
          cb(null, true);
        } else {
          cb(new Error('只接受Excel文件(.xlsx, .xls)'), false);
        }
      },
    }),
  ],
  controllers: [ExamController],
  providers: [
    ExamService,
    LoggerService,
    {
      provide: 'PRISMA_CLIENT',
      useValue: new PrismaClient(),
    },
  ],
  exports: [ExamService],
})
export class ExamModule {}
