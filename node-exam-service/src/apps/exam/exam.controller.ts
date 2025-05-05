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
  ForbiddenException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { QueryExamDto } from './dto/query-exam.dto';
import { CreatePrivateExamDto } from './dto/create-private-exam.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';
import { VerifyInvitationDto } from './dto/verify-invitation.dto';
import { SubmitExamDto } from './dto/submit-exam.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { QueryUserFavoritesDto } from './dto/query-user-favorites.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDecodeDto } from '../auth/dto/user-decode.dto';
import { QueryUserExamsDto } from './dto/query-user-exams.dto';

@ApiTags('exam')
@Controller()
export class ExamController {
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

  @ApiOperation({ summary: '创建试卷分类' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: '创建成功',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '创建分类成功' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: '前端开发' },
            description: { type: 'string', example: '前端开发相关试题' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '参数错误或分类名称已存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('category')
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    try {
      const category = await this.examService.createCategory(createCategoryDto);

      return {
        code: 200,
        message: '创建分类成功',
        data: category,
      };
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: '更新试卷分类' })
  @ApiParam({ name: 'id', description: '分类ID', type: 'number' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '更新分类成功' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: '前端开发' },
            description: { type: 'string', example: '前端开发相关试题' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '参数错误或分类名称已存在' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('category/:id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    try {
      const category = await this.examService.updateCategory(
        id,
        updateCategoryDto,
      );

      return {
        code: 200,
        message: '更新分类成功',
        data: category,
      };
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: '删除试卷分类' })
  @ApiParam({ name: 'id', description: '分类ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '删除分类成功' },
        data: { type: 'null', example: null },
      },
    },
  })
  @ApiResponse({ status: 400, description: '分类下有子分类或试卷，无法删除' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('category/delete/:id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.examService.deleteCategory(id);

      return {
        code: 200,
        message: '删除分类成功',
        data: null,
      };
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: '创建试卷子分类' })
  @ApiBody({ type: CreateSubCategoryDto })
  @ApiResponse({
    status: 201,
    description: '创建成功',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '创建子分类成功' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 2 },
            name: { type: 'string', example: 'Vue' },
            description: { type: 'string', example: 'Vue框架相关试题' },
            categoryId: { type: 'number', example: 1 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '参数错误或子分类名称已存在' })
  @ApiResponse({ status: 404, description: '父分类不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('subcategory')
  async createSubCategory(@Body() createSubCategoryDto: CreateSubCategoryDto) {
    try {
      const subCategory =
        await this.examService.createSubCategory(createSubCategoryDto);

      return {
        code: 200,
        message: '创建子分类成功',
        data: subCategory,
      };
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: '更新试卷子分类' })
  @ApiParam({ name: 'id', description: '子分类ID', type: 'number' })
  @ApiBody({ type: UpdateSubCategoryDto })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '更新子分类成功' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 2 },
            name: { type: 'string', example: 'Vue' },
            description: { type: 'string', example: 'Vue框架相关试题' },
            categoryId: { type: 'number', example: 1 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '参数错误或子分类名称已存在' })
  @ApiResponse({ status: 404, description: '子分类不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('subcategory/:id')
  async updateSubCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
  ) {
    try {
      const subCategory = await this.examService.updateSubCategory(
        id,
        updateSubCategoryDto,
      );

      return {
        code: 200,
        message: '更新子分类成功',
        data: subCategory,
      };
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: '删除试卷子分类' })
  @ApiParam({ name: 'id', description: '子分类ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '删除子分类成功' },
        data: { type: 'null', example: null },
      },
    },
  })
  @ApiResponse({ status: 400, description: '子分类下有试卷，无法删除' })
  @ApiResponse({ status: 404, description: '子分类不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('subcategory/delete/:id')
  async deleteSubCategory(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.examService.deleteSubCategory(id);

      return {
        code: 200,
        message: '删除子分类成功',
        data: null,
      };
    } catch (error) {
      throw error;
    }
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
    try {
      const result = await this.examService.getExamList(queryExamDto);

      return {
        code: 200,
        message: '获取试卷列表成功',
        data: result,
      };
    } catch (error) {
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
      console.log(
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
    console.log(`检查试卷 ${examId} 是否被用户 ${userId} 收藏`);

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
    console.log(`切换试卷 ${examId} 的收藏状态，用户 ${userId}`);

    const result = await this.examService.toggleFavorite(examId, userId);

    return {
      code: 200,
      message: result.isFavorite ? '收藏成功' : '取消收藏成功',
      data: result,
    };
  }

  @ApiOperation({ summary: '获取用户收藏列表' })
  @ApiResponse({ status: 200, description: '成功获取收藏列表' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权查看其他用户的收藏列表' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('exam/getUserFavorites')
  async getUserFavorites(
    @Req() req,
    @Body() queryUserFavoritesDto: QueryUserFavoritesDto,
  ) {
    // 从请求中获取当前用户ID
    const currentUserId = req.user.userId;

    // 确定要查询的用户ID
    // 如果传入了userId参数且当前用户是管理员，则使用传入的userId
    // 否则使用当前用户的ID
    let targetUserId = currentUserId;

    try {
      if (queryUserFavoritesDto.userId) {
        targetUserId = queryUserFavoritesDto.userId;
      }

      console.log(
        `获取用户 ${targetUserId} 的收藏列表，请求用户ID: ${currentUserId}`,
      );

      const result = await this.examService.getUserFavorites(
        targetUserId,
        queryUserFavoritesDto,
      );

      return {
        code: 200,
        message: '获取收藏列表成功',
        data: result,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      console.error(`获取收藏列表失败: ${error.message}`);
      throw new BadRequestException(`获取收藏列表失败: ${error.message}`);
    }
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
    console.log(`创建专属试卷请求, 用户ID: ${userId}`);

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
    console.log(`获取专属试卷列表, 用户ID: ${userId}`);

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
      throw error;
    }
  }

  @ApiOperation({ summary: '获取面试官的专属试卷列表' })
  @ApiResponse({
    status: 200,
    description: '返回指定面试官的专属试卷列表',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取面试官专属试卷列表成功' },
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
  @ApiQuery({
    name: 'interviewerId',
    required: true,
    type: 'number',
    description: '面试官ID',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
    description: '页码，默认1',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: 'number',
    description: '每页数量，默认10',
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    type: 'string',
    description: '搜索关键词',
  })
  @ApiQuery({
    name: 'sortField',
    required: false,
    type: 'string',
    description: '排序字段',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: 'string',
    description: '排序方向: asc/desc',
  })
  @Post('exam/private/interviewer')
  async getInterviewerPrivateExams(
    @Body('interviewerId', ParseIntPipe) interviewerId: number,
    @Body() queryExamDto: QueryExamDto,
  ) {
    try {
      const result = await this.examService.getInterviewerPrivateExams(
        interviewerId,
        queryExamDto,
      );

      return {
        code: 200,
        message: '获取面试官专属试卷列表成功',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: '获取专属试卷详情' })
  @ApiResponse({
    status: 200,
    description: '返回专属试卷详情',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取专属试卷详情成功' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: '试卷不存在' })
  @Get('exam/private/:id')
  async getPrivateExamDetail(@Param('id', ParseIntPipe) id: number) {
    try {
      const exam = await this.examService.getPrivateExamDetail(id);

      return {
        code: 200,
        message: '获取专属试卷详情成功',
        data: exam,
      };
    } catch (error) {
      throw error;
    }
  }

  // 在线考试相关接口
  @Post('invitation/verify')
  @ApiOperation({ summary: '验证考试邀请码' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '验证成功，返回考试信息',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '邀请码无效或已过期',
  })
  async verifyInvitationCode(@Body() verifyDto: VerifyInvitationDto) {
    try {
      const result = await this.examService.verifyInvitationCode(
        verifyDto.invitationCode,
      );
      return {
        code: HttpStatus.OK,
        data: result,
        message: '验证成功',
      };
    } catch (error) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: error.message || '邀请码验证失败',
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({ summary: '开始考试并获取试卷内容' })
  @ApiParam({ name: 'code', description: '邀请码', type: 'string' })
  @ApiResponse({
    status: 200,
    description: '获取试卷内容成功',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取试卷内容成功' },
        data: {
          type: 'object',
          properties: {
            examId: { type: 'number', example: 1 },
            examTitle: { type: 'string', example: '前端开发笔试' },
            questions: { type: 'array', items: { type: 'object' } },
            duration: { type: 'number', example: 120 },
            startTime: { type: 'string', example: '2023-06-01T10:30:00Z' },
            endTime: { type: 'string', example: '2023-06-01T12:30:00Z' },
          },
        },
      },
    },
  })
  @Get('online-exam/start/:code')
  async startExam(@Param('code') invitationCode: string) {
    try {
      const result = await this.examService.startExam(invitationCode);

      return {
        code: 200,
        message: '获取试卷内容成功',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: '提交考试答案' })
  @ApiBody({ type: SubmitExamDto })
  @ApiResponse({
    status: 200,
    description: '提交答案成功',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '提交答案成功' },
        data: {
          type: 'object',
          properties: {
            score: { type: 'number', example: 85 },
            totalScore: { type: 'number', example: 100 },
            percentage: { type: 'number', example: 85 },
          },
        },
      },
    },
  })
  @Post('online-exam/submit')
  async submitExam(@Body() submitExamDto: SubmitExamDto) {
    try {
      const result = await this.examService.submitExam(
        submitExamDto.invitationCode,
        submitExamDto.answers,
      );

      return {
        code: 200,
        message: '提交答案成功',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: '获取在线考试结果' })
  @ApiResponse({
    status: 200,
    description: '获取考试结果成功',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取考试结果成功' },
        data: {
          type: 'object',
          properties: {
            examTitle: { type: 'string', example: 'JavaScript基础测试' },
            submittedAt: { type: 'string', example: '2023-05-15T08:30:00Z' },
            score: { type: 'number', example: 85 },
            totalScore: { type: 'number', example: 100 },
            percentage: { type: 'number', example: 85 },
            duration: { type: 'number', example: 3600 },
            correctCount: { type: 'number', example: 17 },
            totalQuestions: { type: 'number', example: 20 },
            questions: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
  })
  @Get('online-exam/result/:invitationCode')
  async getOnlineExamResult(@Param('invitationCode') invitationCode: string) {
    try {
      const result = await this.examService.getExamResult(invitationCode);

      return {
        code: 200,
        message: '获取考试结果成功',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  // 获取用户的考试列表
  @Post('online-exam/user-exams')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取用户的考试列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功，返回考试列表',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  examId: { type: 'number', example: 100 },
                  examTitle: { type: 'string', example: 'JavaScript基础测试' },
                  status: { type: 'string', example: 'PENDING' },
                  score: { type: 'number', example: 0 },
                  duration: { type: 'number', example: 60 },
                  startTime: {
                    type: 'string',
                    example: '2023-05-15T08:00:00Z',
                  },
                  endTime: { type: 'string', example: '2023-05-15T09:00:00Z' },
                  invitationCode: { type: 'string', example: 'abc123def456' },
                  companyId: { type: 'number', example: 5 },
                  companyName: { type: 'string', example: '示例科技有限公司' },
                  positionId: { type: 'number', example: 10 },
                  positionName: { type: 'string', example: '前端开发工程师' },
                },
              },
            },
            total: { type: 'number', example: 10 },
          },
        },
        message: { type: 'string', example: '获取成功' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '获取失败',
  })
  async getUserExams(
    @Body() queryDto: QueryUserExamsDto,
    @CurrentUser() user: UserDecodeDto,
  ) {
    try {
      const { items, total } = await this.examService.getUserExams(
        user.userId,
        queryDto,
      );

      return {
        code: HttpStatus.OK,
        data: { items, total },
        message: '获取成功',
      };
    } catch (error) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: error.message || '获取考试列表失败',
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
