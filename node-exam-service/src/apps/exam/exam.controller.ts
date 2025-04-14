import { Controller, Get, Post, Body, Param, ParseIntPipe, UseInterceptors, UploadedFile, Req, Query, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { QueryExamDto } from './dto/query-exam.dto';

@Controller()
export class ExamController {
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
    const result = await this.examService.getExamList(queryExamDto);
    return {
      code: 200,
      message: '获取试卷列表成功',
      data: result,
    };
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
  @UseInterceptors(FileInterceptor('file'))
  async uploadExam(
    @Body() createExamDto: CreateExamDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const userId = req.user.userId;
    const exam = await this.examService.createExam(createExamDto, userId, file);
    return {
      code: 200,
      message: '上传试卷成功',
      data: exam,
    };
  }
} 