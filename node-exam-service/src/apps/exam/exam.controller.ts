import { Controller, Get, Post, Body, Param, ParseIntPipe, UseInterceptors, UploadedFile, Req, Query, UseGuards, BadRequestException, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { QueryExamDto } from './dto/query-exam.dto';

@Controller()
export class ExamController {
  private readonly logger = new Logger(ExamController.name);

  constructor(private readonly examService: ExamService) {}

  // 分类相关接口
  @Get('category/list')
  async getAllCategories() {
    const categories = await this.examService.getAllCategories();
    return {
      code: 200,
      message: '获取分类列表成功',
      data: categories,
    };
  }

  // 试卷相关接口
  @Get('exam/list')
  async getExamList(@Query() queryExamDto: QueryExamDto) {
    this.logger.log(`获取试卷列表请求参数: ${JSON.stringify(queryExamDto)}`);
    
    try {
      const result = await this.examService.getExamList(queryExamDto);
      
      this.logger.log(`获取试卷列表成功，返回 ${result.total} 条记录`);
      
      return {
        code: 200,
        message: '获取试卷列表成功',
        data: result,
      };
    } catch (error) {
      this.logger.error(`获取试卷列表失败: ${error.message}`);
      throw error;
    }
  }

  @Get('exam/:id')
  async getExamDetail(@Param('id', ParseIntPipe) id: number) {
    const exam = await this.examService.getExamDetail(id);
    return {
      code: 200,
      message: '获取试卷详情成功',
      data: exam,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('exam/upload')
  @UseInterceptors(
    FileInterceptor('file')
  )
  async uploadExam(
    @Body() createExamDto: CreateExamDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('上传文件不能为空');
      }
      
      // 确保文件对象包含必要的信息
      if (!file.originalname || file.originalname.trim() === '') {
        file.originalname = 'unknown_file.xlsx';
      }
      
      // 记录文件信息
      this.logger.log(`接收到上传文件: ${file.originalname}, 大小: ${file.size} 字节`);
      
      const userId = req.user.userId;
      const exam = await this.examService.createExam(createExamDto, userId, file);
      
      return {
        code: 200,
        message: '上传试卷成功',
        data: exam,
      };
    } catch (error) {
      this.logger.error(`上传试卷失败: ${error.message}`);
      throw error;
    }
  }
} 