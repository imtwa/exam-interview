import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Req,
  Query,
  UseGuards,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { QueryExamDto } from './dto/query-exam.dto';
import { CreatePrivateExamDto } from './dto/create-private-exam.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('exam')
@Controller()
export class ExamController {
  private readonly logger = new Logger(ExamController.name);

  constructor(private readonly examService: ExamService) {}

  // 分类相关接口
  @ApiOperation({ summary: '获取所有试卷分类' })
  @ApiResponse({
    status: 200,
    description: '返回分类列表',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取分类列表成功' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: '前端开发' },
              subCategories: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 2 },
                    name: { type: 'string', example: 'Vue' },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
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
  @ApiOperation({ summary: '分页获取试卷列表' })
  @ApiResponse({
    status: 200,
    description: '返回试卷列表及分页信息',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取试卷列表成功' },
        data: {
          type: 'object',
          properties: {
            items: { type: 'array', items: { type: 'object' } },
            total: { type: 'number', example: 100 },
          },
        },
      },
    },
  })
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

  @ApiOperation({ summary: '获取试卷详情' })
  @ApiParam({ name: 'id', description: '试卷ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: '返回试卷详情',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取试卷详情成功' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: '试卷不存在' })
  @Get('exam/:id')
  async getExamDetail(@Param('id', ParseIntPipe) id: number) {
    const exam = await this.examService.getExamDetail(id);
    return {
      code: 200,
      message: '获取试卷详情成功',
      data: exam,
    };
  }

  @ApiOperation({ summary: '上传试卷' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '试卷Excel文件',
        },
        name: {
          type: 'string',
          description: '试卷名称',
        },
        description: {
          type: 'string',
          description: '试卷简介',
        },
        categoryId: {
          type: 'number',
          description: '分类ID',
        },
        subCategoryId: {
          type: 'number',
          description: '二级分类ID',
        },
        isPublic: {
          type: 'boolean',
          description: '是否公开',
        },
      },
      required: ['file', 'name', 'categoryId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '上传试卷成功',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '上传试卷成功' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '上传文件不能为空或格式错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('exam/upload')
  @UseInterceptors(FileInterceptor('file'))
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
      this.logger.log(
        `接收到上传文件: ${file.originalname}, 大小: ${file.size} 字节`,
      );

      const userId = req.user.userId;
      const exam = await this.examService.createExam(
        createExamDto,
        userId,
        file,
      );

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

  // 收藏相关接口
  @ApiOperation({ summary: '检查试卷收藏状态' })
  @ApiParam({ name: 'id', description: '试卷ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: '返回收藏状态',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '检查收藏状态成功' },
        data: {
          type: 'object',
          properties: {
            isFavorite: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('exam/favorite/:id')
  async checkFavorite(@Param('id', ParseIntPipe) examId: number, @Req() req) {
    const userId = req.user.userId;
    this.logger.log(`检查试卷 ${examId} 是否被用户 ${userId} 收藏`);

    const isFavorite = await this.examService.checkFavorite(examId, userId);

    return {
      code: 200,
      message: '检查收藏状态成功',
      data: { isFavorite },
    };
  }

  @ApiOperation({ summary: '切换试卷收藏状态' })
  @ApiParam({ name: 'id', description: '试卷ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: '切换收藏状态成功',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '收藏成功' },
        data: {
          type: 'object',
          properties: {
            isFavorite: { type: 'boolean', example: true },
            favoriteCount: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '试卷不存在' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('exam/favorite/:id')
  async toggleFavorite(@Param('id', ParseIntPipe) examId: number, @Req() req) {
    const userId = req.user.userId;
    this.logger.log(`切换试卷 ${examId} 的收藏状态，用户 ${userId}`);

    const result = await this.examService.toggleFavorite(examId, userId);

    return {
      code: 200,
      message: result.isFavorite ? '收藏成功' : '取消收藏成功',
      data: result,
    };
  }

  @ApiOperation({ summary: '获取用户收藏的试卷列表' })
  @ApiResponse({
    status: 200,
    description: '返回收藏列表',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取收藏列表成功' },
        data: {
          type: 'object',
          properties: {
            items: { type: 'array', items: { type: 'object' } },
            total: { type: 'number', example: 15 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('exam/favorites')
  async getUserFavorites(@Req() req, @Query() queryExamDto: QueryExamDto) {
    const userId = req.user.userId;
    this.logger.log(`获取用户 ${userId} 的收藏列表`);

    const result = await this.examService.getUserFavorites(
      userId,
      queryExamDto,
    );

    return {
      code: 200,
      message: '获取收藏列表成功',
      data: result,
    };
  }

  // 专属试卷相关接口
  @ApiOperation({ summary: '创建HR专属试卷（从收藏试卷中抽题）' })
  @ApiBody({ type: CreatePrivateExamDto })
  @ApiResponse({
    status: 200,
    description: '创建专属试卷成功',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '创建专属试卷成功' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '请求数据错误或未找到指定的收藏试卷',
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '只有面试官可以创建专属试卷' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('exam/private')
  async createPrivateExam(
    @Body() createPrivateExamDto: CreatePrivateExamDto,
    @Req() req,
  ) {
    const userId = req.user.userId;
    this.logger.log(`创建专属试卷请求, 用户ID: ${userId}`);

    try {
      const exam = await this.examService.createPrivateExam(
        createPrivateExamDto,
        userId,
      );

      return {
        code: 200,
        message: '创建专属试卷成功',
        data: exam,
      };
    } catch (error) {
      this.logger.error(`创建专属试卷失败: ${error.message}`);
      throw error;
    }
  }

  @ApiOperation({ summary: '获取HR的专属试卷列表' })
  @ApiResponse({
    status: 200,
    description: '返回专属试卷列表',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取专属试卷列表成功' },
        data: {
          type: 'object',
          properties: {
            items: { type: 'array', items: { type: 'object' } },
            total: { type: 'number', example: 5 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('exam/private')
  async getPrivateExams(@Req() req, @Query() queryExamDto: QueryExamDto) {
    const userId = req.user.userId;
    this.logger.log(`获取专属试卷列表, 用户ID: ${userId}`);

    try {
      const result = await this.examService.getPrivateExams(
        userId,
        queryExamDto,
      );

      return {
        code: 200,
        message: '获取专属试卷列表成功',
        data: result,
      };
    } catch (error) {
      this.logger.error(`获取专属试卷列表失败: ${error.message}`);
      throw error;
    }
  }
}
