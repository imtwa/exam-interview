import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { success } from '../../common/utils/response.util';
import { LoggerService } from '../../common/logger/logger.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  private readonly logger: LoggerService;

  constructor(
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext('UploadController');
  }

  @ApiOperation({ summary: '上传求职者简历' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('resume')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(@UploadedFile() file, @Request() req) {
    if (!file) {
      throw new BadRequestException('未上传文件');
    }

    this.logger.log(`用户${req.user.userId}上传简历: ${file.originalname}`);

    // 从环境变量获取上传路径
    const uploadsPath = this.configService.get('UPLOADS_PATH') || 'uploads';

    // 构建正确的相对路径
    const relativePath = `${uploadsPath}/resumes/${file.filename}`;

    // 解码文件名，确保中文文件名正确显示
    const decodedFileName = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );

    // 创建简历数据对象
    const resumeData = {
      path: relativePath,
      originalName: decodedFileName,
    };

    // 更新求职者简历URL和原始文件名
    await this.uploadService.updateJobSeekerResume(req.user.userId, resumeData);

    // 获取服务器基础URL
    const baseUrl =
      this.configService.get('APP_URL') ||
      `http://localhost:${this.configService.get('PORT') || 3000}`;

    // 构建文件完整URL
    const fileUrl = `${baseUrl}/${relativePath}`;

    return success(
      {
        url: fileUrl,
        filename: decodedFileName,
        resumePath: relativePath,
        mimetype: file.mimetype,
        size: file.size,
      },
      '简历上传成功',
    );
  }
}
