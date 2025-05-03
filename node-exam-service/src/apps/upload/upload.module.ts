import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '../../../prisma/generated/client';
import { LoggerModule } from '../../common/logger/logger.module';
import * as fs from 'fs';

@Module({
  imports: [
    LoggerModule,
    ConfigModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uploadsPath = configService.get('UPLOADS_PATH') || 'uploads';
        return {
          storage: diskStorage({
            destination: (req, file, cb) => {
              // 确保目录存在
              const dir = `${uploadsPath}/resumes`;
              
              // 创建目录（如果不存在）
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }
              
              cb(null, dir);
            },
            filename: (req, file, cb) => {
              // 生成唯一文件名，保留原始扩展名
              const uniqueSuffix = uuidv4();
              // 处理中文文件名的扩展名
              const originalName = Buffer.from(
                file.originalname,
                'latin1'
              ).toString('utf8');
              const fileExt = extname(originalName);
              const filename = `${uniqueSuffix}${fileExt}`;
              cb(null, filename);
            },
          }),
          fileFilter: (req, file, cb) => {
            // 只允许上传PDF文件
            if (file.mimetype !== 'application/pdf') {
              return cb(new Error('只支持上传PDF文件'), false);
            }
            cb(null, true);
          },
          limits: {
            fileSize: 3 * 1024 * 1024, // 限制3MB
          },
        };
      },
    }),
  ],
  controllers: [UploadController],
  providers: [
    UploadService,
    {
      provide: 'PRISMA_CLIENT',
      useValue: new PrismaClient(),
    },
  ],
  exports: [UploadService],
})
export class UploadModule {}
