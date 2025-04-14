import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../../../prisma/generated/client';
import { LoggerService } from '../../common/logger/logger.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { QueryExamDto, ExamSortField } from './dto/query-exam.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as multer from 'multer';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExamService {
  private readonly logger: LoggerService;
  private readonly uploadDir: string;

  constructor(
    @Inject('PRISMA_CLIENT')
    private prisma: PrismaClient,
    private loggerService: LoggerService,
    private configService: ConfigService,
  ) {
    this.logger = loggerService;
    this.logger.setContext('ExamService');

    const uploadsPath = this.configService.get('UPLOADS_PATH')
    const uploadsExamsPath = this.configService.get('UPLOADS_EXAMS_PATH')


    // 确保上传目录存在
    this.uploadDir = path.join(process.cwd(), uploadsPath, uploadsExamsPath);
    this.ensureUploadDir();
  }

  /**
   * 确保上传目录存在
   */
  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`创建上传目录: ${this.uploadDir}`);
    }
  }

  /**
   * 获取试卷列表
   * @param queryExamDto 查询参数
   */
  async getExamList(queryExamDto: QueryExamDto) {
    const {
      page = 1,
      pageSize = 10,
      categoryId,
      subCategoryId,
      keyword,
      sortField = ExamSortField.CREATED_AT,
      sortOrder = 'desc',
    } = queryExamDto;

    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {
      deletedAt: null,
      isPublic: true, // 只返回公开的试卷
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (subCategoryId) {
      where.subCategoryId = subCategoryId;
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { summary: { contains: keyword } },
        { description: { contains: keyword } },
      ];
    }

    // 执行查询
    const [exams, total] = await Promise.all([
      this.prisma.examPaper.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          [sortField]: sortOrder,
        },
        include: {
          category: true,
          subCategory: true,
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      }),
      this.prisma.examPaper.count({ where }),
    ]);

    return {
      items: exams,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取试卷详情
   * @param id 试卷ID
   */
  async getExamDetail(id: number) {
    this.logger.log(`获取试卷详情: ${id}`);

    const exam = await this.prisma.examPaper.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        category: true,
        subCategory: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        examQuestions: {
          where: {
            deletedAt: null,
          },
          include: {
            question: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!exam) {
      this.logger.warn(`试卷不存在: ${id}`);
      throw new NotFoundException('试卷不存在');
    }

    return exam;
  }

  /**
   * 配置文件上传存储
   */
  getMulterStorage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        // 从请求体中获取试卷名称
        const examName = req.body.name || 'exam';
        
        // 生成5位时间戳（取当前时间戳的后5位）
        const timestamp = Date.now().toString().slice(-5);
        
        // 安全处理文件名（移除特殊字符）
        const safeExamName = examName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
        
        // 确保文件有正确的扩展名
        let ext = path.extname(file.originalname);
        if (!ext || ext.toLowerCase() !== '.xlsx') {
          ext = '.xlsx'; // 默认使用.xlsx扩展名
        }
        
        // 组合文件名：试卷名称 + 时间戳 + 扩展名
        const filename = `${safeExamName}_${timestamp}${ext}`;
        
        this.logger.log(`上传文件重命名为: ${filename}`);
        cb(null, filename);
      },
    });
  }

  /**
   * 解析Excel文件，提取题目
   * @param filePath Excel文件路径
   */
  async parseExcelFile(filePath: string) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new BadRequestException('Excel文件格式不正确或无数据');
      }

      // 不要记录整个worksheet对象，这会导致循环引用错误
      this.logger.log(
        `解析Excel文件：${filePath}, 工作表: ${worksheet.name}, 行数: ${worksheet.rowCount}`,
      );

      const data = [];
      const headers = [];

      // 读取表头
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value.toString().trim();
      });

      // 检查必需的列是否存在
      if (!headers.includes('question') || !headers.includes('answer')) {
        throw new BadRequestException(
          'Excel文件格式不正确，必须包含question和answer列',
        );
      }

      // 读取数据行
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // 跳过表头

        const rowData = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          if (header) {
            rowData[header] = cell.value;
          }
        });

        data.push(rowData);
      });

      if (data.length === 0) {
        throw new BadRequestException('Excel文件中没有数据');
      }

      return data.map((row: any, index) => ({
        qtype: row.qtype || 1, // 默认题型为单选题
        question: row.question,
        options: row.options,
        answer: row.answer,
        ai_analysis: row.ai_analysis || '',
        difficulty: row.difficulty || 1,
        order: index + 1,
        score: row.score || 1,
      }));
    } catch (error) {
      this.logger.error(`解析Excel文件失败: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('解析Excel文件失败，请检查文件格式');
    }
  }

  /**
   * 检查分类是否存在
   * @param categoryId 分类ID
   */
  async checkCategoryExists(categoryId: number) {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
        deletedAt: null,
      },
    });

    if (!category) {
      throw new NotFoundException(`分类不存在: ${categoryId}`);
    }

    return category;
  }

  /**
   * 检查二级分类是否存在
   * @param subCategoryId 二级分类ID
   */
  async checkSubCategoryExists(subCategoryId: number) {
    const subCategory = await this.prisma.subCategory.findUnique({
      where: {
        id: subCategoryId,
        deletedAt: null,
      },
    });

    if (!subCategory) {
      throw new NotFoundException(`二级分类不存在: ${subCategoryId}`);
    }

    return subCategory;
  }

  /**
   * 获取所有分类列表（包含子分类）
   * 返回一个树形结构，一级分类包含二级分类
   */
  async getAllCategories() {
    this.logger.log('获取所有分类列表');

    // 获取所有一级分类
    const categories = await this.prisma.category.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        id: 'asc',
      },
    });

    // 为每个一级分类获取对应的二级分类
    const result = await Promise.all(
      categories.map(async (category) => {
        const subCategories = await this.prisma.subCategory.findMany({
          where: {
            categoryId: category.id,
            deletedAt: null,
          },
          orderBy: {
            id: 'asc',
          },
        });

        return {
          ...category,
          children: subCategories,
        };
      }),
    );

    return result;
  }

  /**
   * 创建试卷及其题目
   * @param createExamDto 创建试卷DTO
   * @param userId 用户ID
   * @param file 上传的Excel文件
   */
  async createExam(
    createExamDto: CreateExamDto,
    userId: number,
    file: Express.Multer.File,
  ) {
    this.logger.log(`创建试卷: ${createExamDto.name}, 用户ID: ${userId}`);

    // 检查分类是否存在
    await this.checkCategoryExists(createExamDto.categoryId);

    // 检查二级分类是否存在
    if (createExamDto.subCategoryId) {
      await this.checkSubCategoryExists(createExamDto.subCategoryId);
    }

    // 解析Excel文件
    const questions = await this.parseExcelFile(file.path);

    // 创建试卷
    const exam = await this.prisma.examPaper.create({
      data: {
        name: createExamDto.name,
        summary: createExamDto.summary,
        description: createExamDto.description,
        categoryId: createExamDto.categoryId,
        subCategoryId: createExamDto.subCategoryId,
        userId,
        isPublic: createExamDto.isPublic ?? true,
      },
    });

    // 创建题目和关联
    for (const questionData of questions) {
      // 创建题目
      const question = await this.prisma.question.create({
        data: {
          qtype: questionData.qtype,
          question: questionData.question,
          options: questionData.options,
          answer: questionData.answer,
          ai_analysis: questionData.ai_analysis,
          difficulty: questionData.difficulty,
          userId,
        },
      });

      // 关联题目和试卷
      await this.prisma.examQuestion.create({
        data: {
          examId: exam.id,
          questionId: question.id,
          order: questionData.order,
          score: questionData.score,
        },
      });
    }

    // 返回创建的试卷
    return this.getExamDetail(exam.id);
  }
}
