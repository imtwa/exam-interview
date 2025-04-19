import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../../../prisma/generated/client';
import { LoggerService } from '../../common/logger/logger.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { QueryExamDto, ExamSortField } from './dto/query-exam.dto';
import { CreatePrivateExamDto } from './dto/create-private-exam.dto';
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

    const uploadsPath = this.configService.get('UPLOADS_PATH');
    const uploadsExamsPath = this.configService.get('UPLOADS_EXAMS_PATH');

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
    this.logger.log(`获取试卷列表, 参数: ${JSON.stringify(queryExamDto)}`);

    try {
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
        where.categoryId = parseInt(categoryId.toString(), 10);
        this.logger.log(`按一级分类ID过滤: ${where.categoryId}`);
      }

      if (subCategoryId) {
        where.subCategoryId = parseInt(subCategoryId.toString(), 10);
        this.logger.log(`按二级分类ID过滤: ${where.subCategoryId}`);
      }

      if (keyword) {
        where.OR = [
          { name: { contains: keyword } },
          { description: { contains: keyword } },
        ];
        this.logger.log(`按关键词过滤: ${keyword}`);
      }

      this.logger.log(`执行查询, 查询条件: ${JSON.stringify(where)}`);

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
                role: true,
              },
            },
            examQuestions: {
              where: {
                deletedAt: null,
              },
              include: {
                question: true,
              },
            },
          },
        }),
        this.prisma.examPaper.count({ where }),
      ]);

      // 处理返回数据，添加题目总数等信息
      const enrichedExams = exams.map((exam) => {
        const questionsCount = exam.examQuestions.length;
        // 从examQuestions中移除question详情以减小数据量
        const { examQuestions, ...examData } = exam;

        return {
          ...examData,
          questionsCount, // 添加题目总数
        };
      });

      this.logger.log(
        `查询结果: 共 ${enrichedExams.length} 条记录, 总数 ${total}`,
      );

      return {
        items: enrichedExams,
        total,
        page,
        pageSize,
      };
    } catch (error) {
      this.logger.error(`获取试卷列表失败: ${error.message}`);
      throw error;
    }
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
        const safeExamName = examName.replace(
          /[^a-zA-Z0-9\u4e00-\u9fa5]/g,
          '_',
        );

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
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        this.logger.error(`文件不存在: ${filePath}`);
        throw new BadRequestException('上传的文件不存在或已被删除');
      }

      this.logger.log(`开始读取文件: ${filePath}`);

      // 检查文件大小
      const stats = fs.statSync(filePath);
      this.logger.log(`文件大小: ${stats.size} 字节`);

      if (stats.size === 0) {
        throw new BadRequestException('Excel文件为空');
      }

      // 读取文件内容
      const fileBuffer = fs.readFileSync(filePath);
      this.logger.log(`成功读取文件内容，大小: ${fileBuffer.length} 字节`);

      // 创建工作簿实例
      const workbook = new ExcelJS.Workbook();

      try {
        // 尝试读取文件
        await workbook.xlsx.load(fileBuffer);
        this.logger.log(`成功加载Excel工作簿`);
      } catch (error) {
        this.logger.error(`Excel工作簿加载失败: ${error.message}`);
        throw new BadRequestException(`无法读取Excel文件: ${error.message}`);
      }

      // 获取工作表数量
      const worksheetCount = workbook.worksheets.length;
      this.logger.log(`工作簿中的工作表数量: ${worksheetCount}`);

      if (worksheetCount === 0) {
        throw new BadRequestException('Excel文件中没有工作表');
      }

      // 获取第一个工作表
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new BadRequestException('Excel文件格式不正确或无数据');
      }

      this.logger.log(
        `工作表信息: 名称=${worksheet.name}, 行数=${worksheet.rowCount}, 列数=${worksheet.columnCount}`,
      );

      if (worksheet.rowCount <= 1) {
        throw new BadRequestException('Excel文件中没有数据行，只有表头或为空');
      }

      // 打印工作表结构以便调试
      const sheetStructure = [];

      // 获取表头行
      const headerRow = [];
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        if (cell.value) {
          headerRow.push(`${colNumber}: ${cell.value.toString().trim()}`);
        }
      });

      if (headerRow.length === 0) {
        throw new BadRequestException('Excel表头行为空');
      }

      sheetStructure.push(`表头: ${headerRow.join(', ')}`);

      // 获取前5行数据作为样本（或者所有行，如果少于5行）
      const sampleRows = Math.min(5, worksheet.rowCount - 1);
      let hasDataRows = false;

      for (let i = 2; i <= sampleRows + 1; i++) {
        const row = worksheet.getRow(i);
        const rowValues = [];

        row.eachCell((cell, colNumber) => {
          if (cell.value) {
            rowValues.push(`${colNumber}: ${cell.value.toString().trim()}`);
            hasDataRows = true;
          }
        });

        if (rowValues.length > 0) {
          sheetStructure.push(`第${i}行: ${rowValues.join(', ')}`);
        }
      }

      if (!hasDataRows) {
        throw new BadRequestException('Excel文件数据行为空');
      }

      // 记录结构信息
      this.logger.log(`Excel文件结构:\n${sheetStructure.join('\n')}`);

      // 根据Excel格式进行解析
      const questions = [];

      // 跳过的行数
      const skipLen = 2;

      // 从第3行开始读取数据（跳过解释和表头）
      for (
        let rowNumber = skipLen + 1;
        rowNumber <= worksheet.rowCount;
        rowNumber++
      ) {
        const row = worksheet.getRow(rowNumber);

        // 跳过空行
        if (row.cellCount === 0) {
          this.logger.debug(`跳过空行: ${rowNumber}`);
          continue;
        }

        try {
          // 检查行是否有内容
          let hasContent = false;
          row.eachCell(() => {
            hasContent = true;
          });

          if (!hasContent) {
            this.logger.debug(`跳过无内容行: ${rowNumber}`);
            continue;
          }

          // 通过列索引直接获取数据并记录
          const cellLog = [];
          const stemCell = row.getCell(1); // 题干在第1列
          cellLog.push(`题干(1): ${stemCell.value}`);

          const typeCell = row.getCell(2); // 题型在第2列
          cellLog.push(`题型(2): ${typeCell.value}`);

          const optionACell = row.getCell(3); // 选项A
          cellLog.push(`选项A(3): ${optionACell.value}`);

          const optionBCell = row.getCell(4); // 选项B
          cellLog.push(`选项B(4): ${optionBCell.value}`);

          const optionCCell = row.getCell(5); // 选项C
          cellLog.push(`选项C(5): ${optionCCell.value}`);

          const optionDCell = row.getCell(6); // 选项D
          cellLog.push(`选项D(6): ${optionDCell.value}`);

          const answerCell = row.getCell(11); // 正确答案 (在K列)
          cellLog.push(`答案(11): ${answerCell.value}`);

          const analysisCell = row.getCell(12); // 解析 (在L列)
          cellLog.push(`解析(12): ${analysisCell.value}`);

          const difficultyCell = row.getCell(14); // 难度 (在N列)
          cellLog.push(`难度(14): ${difficultyCell.value}`);

          // 记录该行所有单元格的值
          this.logger.debug(`第${rowNumber}行数据: ${cellLog.join(', ')}`);

          // 检查必要的字段是否存在
          if (!stemCell.value) {
            this.logger.warn(`第${rowNumber}行缺少题干，跳过`);
            continue;
          }

          // 获取题型，默认为单选题
          let qtype = 1;
          if (typeCell.value) {
            const typeText = typeCell.value.toString().trim();
            if (typeText.includes('多选题')) {
              qtype = 2;
            } else if (typeText.includes('判断题')) {
              qtype = 3;
            } else if (typeText.includes('填空题')) {
              qtype = 4;
            }
          }

          // 组装选项
          let options = '';
          const optionsArray = [];

          if (optionACell.value)
            optionsArray.push({
              Key: 'A',
              Value: optionACell.value.toString().trim(),
            });
          if (optionBCell.value)
            optionsArray.push({
              Key: 'B',
              Value: optionBCell.value.toString().trim(),
            });
          if (optionCCell.value)
            optionsArray.push({
              Key: 'C',
              Value: optionCCell.value.toString().trim(),
            });
          if (optionDCell.value)
            optionsArray.push({
              Key: 'D',
              Value: optionDCell.value.toString().trim(),
            });

          // 检查单选题和多选题是否有选项
          if ((qtype === 1 || qtype === 2) && optionsArray.length === 0) {
            this.logger.warn(`第${rowNumber}行是选择题但没有选项，跳过`);
            continue;
          }

          // 将选项数组转换为JSON字符串
          if (optionsArray.length > 0) {
            options = JSON.stringify(optionsArray);
          }

          // 获取答案和解析
          const answer = answerCell.value
            ? answerCell.value.toString().trim()
            : '';
          const analysis = analysisCell.value
            ? analysisCell.value.toString().trim()
            : '';

          // 处理难度
          let difficulty = 1; // 默认难度为简单
          if (difficultyCell.value) {
            const difficultyText = difficultyCell.value.toString().trim();
            if (difficultyText === '易') {
              difficulty = 1;
            } else if (difficultyText === '中') {
              difficulty = 2;
            } else if (difficultyText === '难') {
              difficulty = 3;
            }
          }

          // 创建题目对象
          const question = {
            qtype,
            question: stemCell.value.toString().trim(),
            options,
            answer,
            ai_analysis: analysis,
            difficulty,
            order: rowNumber - skipLen, // 顺序从1开始
            score: 1, // 默认分值
          };

          questions.push(question);
          this.logger.log(
            `成功解析第${rowNumber}行题目: ${question.question.substring(0, 30)}...`,
          );
        } catch (error) {
          this.logger.error(`解析第${rowNumber}行时出错: ${error.message}`);
        }
      }

      if (questions.length === 0) {
        throw new BadRequestException('Excel文件中没有有效题目数据');
      }

      this.logger.log(`成功解析Excel文件，共解析${questions.length}道题目`);
      return questions;
    } catch (error) {
      this.logger.error(`解析Excel文件失败: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `解析Excel文件失败，请检查文件格式: ${error.message}`,
      );
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
    try {
      this.logger.log(`创建试卷: ${createExamDto.name}, 用户ID: ${userId}`);
      this.logger.log(
        `上传文件信息: 文件名=${file.originalname}, 大小=${file.size}, 临时路径=${file.path}`,
      );

      // 检查分类是否存在
      await this.checkCategoryExists(createExamDto.categoryId);

      // 检查二级分类是否存在
      if (createExamDto.subCategoryId) {
        await this.checkSubCategoryExists(createExamDto.subCategoryId);
      }

      // 确保文件存在
      if (!file || (!file.path && !file.buffer)) {
        throw new BadRequestException('未上传文件或文件无效');
      }

      // 处理上传的文件，重命名为试卷名称加时间戳
      const examName = createExamDto.name || 'exam';
      const timestamp = Date.now().toString().slice(-5);
      const safeExamName = examName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
      const newFileName = `${safeExamName}_${timestamp}.xlsx`;

      // 重命名并处理文件
      let newFilePath;
      try {
        newFilePath = await this.processUploadedFile(file, newFileName);
      } catch (fileError) {
        this.logger.error(`处理文件失败: ${fileError.message}`);
        throw new BadRequestException(`处理文件失败: ${fileError.message}`);
      }

      // 检查处理后的文件是否存在
      if (!fs.existsSync(newFilePath)) {
        throw new BadRequestException(`处理后的文件不存在: ${newFilePath}`);
      }

      // 解析Excel文件
      const questions = await this.parseExcelFile(newFilePath);

      // 创建试卷
      const exam = await this.prisma.examPaper.create({
        data: {
          name: createExamDto.name,
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

      // 解析完成后删除Excel文件
      try {
        if (fs.existsSync(newFilePath)) {
          fs.unlinkSync(newFilePath);
          this.logger.log(`已删除Excel文件: ${newFilePath}`);
        }
      } catch (error) {
        this.logger.error(`删除Excel文件失败: ${error.message}`);
        // 不影响主流程，继续返回结果
      }

      // 返回创建的试卷
      return this.getExamDetail(exam.id);
    } catch (error) {
      // 确保无论发生什么错误，都会清理临时文件
      if (file && file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
          this.logger.log(`已删除临时文件: ${file.path}`);
        } catch (cleanupError) {
          this.logger.error(`删除临时文件失败: ${cleanupError.message}`);
        }
      }

      // 记录详细错误信息
      this.logger.error(`创建试卷失败: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`创建试卷失败: ${error.message}`);
    }
  }

  /**
   * 处理上传的文件，重命名并移动到指定位置
   * @param file 上传的文件
   * @param newFilename 新的文件名
   * @returns 新的文件路径
   */
  async processUploadedFile(
    file: Express.Multer.File,
    newFilename: string,
  ): Promise<string> {
    try {
      // 文件存储路径
      const oldPath = file.path;
      const newPath = path.join(this.uploadDir, newFilename);

      this.logger.log(`处理上传文件: 原路径=${oldPath}, 新路径=${newPath}`);

      // 检查原始文件是否存在
      if (!fs.existsSync(oldPath)) {
        this.logger.error(`源文件不存在: ${oldPath}`);
        // 如果源文件不存在，则直接将文件内容写入新路径
        if (file.buffer) {
          this.logger.log(`使用文件缓冲区写入新文件: ${newPath}`);
          // 确保目录存在
          this.ensureUploadDir();
          // 直接从缓冲区写入文件
          fs.writeFileSync(newPath, file.buffer);
          file.path = newPath;
          file.filename = newFilename;
          return newPath;
        } else {
          throw new Error(`源文件不存在且没有文件缓冲区: ${oldPath}`);
        }
      }

      // 确保上传目录存在
      this.ensureUploadDir();

      // 检查目标文件是否已存在
      if (fs.existsSync(newPath)) {
        // 如果已存在，先删除旧文件
        this.logger.log(`目标文件已存在，删除: ${newPath}`);
        fs.unlinkSync(newPath);
      }

      // 复制文件内容，而不是重命名
      // 这样可以避免跨设备移动文件的问题
      this.logger.log(`复制文件内容: ${oldPath} -> ${newPath}`);
      fs.copyFileSync(oldPath, newPath);

      // 尝试删除原始临时文件
      try {
        fs.unlinkSync(oldPath);
        this.logger.log(`已删除临时文件: ${oldPath}`);
      } catch (deleteError) {
        this.logger.warn(
          `无法删除临时文件，这不会影响主流程: ${deleteError.message}`,
        );
      }

      // 更新文件信息
      file.path = newPath;
      file.filename = newFilename;

      this.logger.log(`文件处理成功: ${newFilename}`);
      return newPath;
    } catch (error) {
      this.logger.error(`处理上传文件失败: ${error.message}`);
      throw new Error(`处理上传文件失败: ${error.message}`);
    }
  }

  /**
   * 检查试卷是否被用户收藏
   * @param examId 试卷ID
   * @param userId 用户ID
   * @returns 是否已收藏
   */
  async checkFavorite(examId: number, userId: number): Promise<boolean> {
    this.logger.log(`检查用户 ${userId} 是否收藏了试卷 ${examId}`);

    try {
      // 查询收藏记录
      const favorite = await this.prisma.favorite.findUnique({
        where: {
          userId_examPaperId: {
            userId,
            examPaperId: examId,
          },
          deletedAt: null,
        },
      });

      this.logger.log(`收藏记录查询结果: ${favorite ? '已收藏' : '未收藏'}`);
      return !!favorite;
    } catch (error) {
      this.logger.error(`检查收藏状态失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 添加或取消收藏
   * @param examId 试卷ID
   * @param userId 用户ID
   * @returns 收藏操作结果
   */
  async toggleFavorite(
    examId: number,
    userId: number,
  ): Promise<{ isFavorite: boolean; favoriteCount: number }> {
    this.logger.log(`切换试卷 ${examId} 的收藏状态，用户 ${userId}`);

    try {
      // 首先检查试卷是否存在
      const exam = await this.prisma.examPaper.findUnique({
        where: {
          id: examId,
          deletedAt: null,
        },
      });

      if (!exam) {
        this.logger.error(`试卷不存在: ${examId}`);
        throw new NotFoundException(`试卷不存在: ${examId}`);
      }

      // 检查当前收藏状态
      const favorite = await this.prisma.favorite.findUnique({
        where: {
          userId_examPaperId: {
            userId,
            examPaperId: examId,
          },
        },
      });

      let newFavorite;

      if (favorite) {
        // 如果已经收藏，则取消收藏（软删除）
        if (favorite.deletedAt) {
          // 如果已经被软删除，则恢复
          newFavorite = await this.prisma.favorite.update({
            where: {
              userId_examPaperId: {
                userId,
                examPaperId: examId,
              },
            },
            data: {
              deletedAt: null,
              updatedAt: new Date(),
            },
          });

          // 增加收藏计数
          await this.prisma.examPaper.update({
            where: { id: examId },
            data: {
              favoriteCount: {
                increment: 1,
              },
            },
          });

          this.logger.log(`恢复收藏: 用户=${userId}, 试卷=${examId}`);
        } else {
          // 标记为已删除
          newFavorite = await this.prisma.favorite.update({
            where: {
              userId_examPaperId: {
                userId,
                examPaperId: examId,
              },
            },
            data: {
              deletedAt: new Date(),
              updatedAt: new Date(),
            },
          });

          // 减少收藏计数
          await this.prisma.examPaper.update({
            where: { id: examId },
            data: {
              favoriteCount: {
                decrement: 1,
              },
            },
          });

          this.logger.log(`取消收藏: 用户=${userId}, 试卷=${examId}`);
        }
      } else {
        // 如果没有收藏记录，则创建新的收藏
        newFavorite = await this.prisma.favorite.create({
          data: {
            userId,
            examPaperId: examId,
          },
        });

        // 增加收藏计数
        await this.prisma.examPaper.update({
          where: { id: examId },
          data: {
            favoriteCount: {
              increment: 1,
            },
          },
        });

        this.logger.log(`新增收藏: 用户=${userId}, 试卷=${examId}`);
      }

      // 获取更新后的收藏数量
      const updatedExam = await this.prisma.examPaper.findUnique({
        where: { id: examId },
        select: { favoriteCount: true },
      });

      return {
        isFavorite: !newFavorite.deletedAt,
        favoriteCount: updatedExam.favoriteCount,
      };
    } catch (error) {
      this.logger.error(`切换收藏状态失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取用户收藏的试卷列表
   * @param userId 用户ID
   * @param queryExamDto 查询参数
   * @returns 试卷列表和总数
   */
  async getUserFavorites(userId: number, queryExamDto: QueryExamDto) {
    this.logger.log(
      `获取用户 ${userId} 的收藏列表, 参数: ${JSON.stringify(queryExamDto)}`,
    );

    try {
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
        userId,
        examPaper: {
          deletedAt: null,
        },
      };

      if (categoryId) {
        where.examPaper.categoryId = parseInt(categoryId.toString(), 10);
        this.logger.log(`按一级分类ID过滤: ${where.examPaper.categoryId}`);
      }

      if (subCategoryId) {
        where.examPaper.subCategoryId = parseInt(subCategoryId.toString(), 10);
        this.logger.log(`按二级分类ID过滤: ${where.examPaper.subCategoryId}`);
      }

      if (keyword) {
        where.examPaper.OR = [
          { name: { contains: keyword } },
          { description: { contains: keyword } },
        ];
        this.logger.log(`按关键词过滤: ${keyword}`);
      }

      this.logger.log(`执行收藏查询, 查询条件: ${JSON.stringify(where)}`);

      // 获取收藏数量
      const total = await this.prisma.favorite.count({ where });

      // 获取收藏列表
      const favorites = await this.prisma.favorite.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          [sortField === 'favoriteCount'
            ? 'examPaper.favoriteCount'
            : sortField]: sortOrder,
        },
        include: {
          examPaper: {
            include: {
              category: true,
              subCategory: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  role: true,
                },
              },
              examQuestions: {
                where: {
                  deletedAt: null,
                },
                include: {
                  question: true,
                },
              },
            },
          },
        },
      });

      // 处理返回数据，格式化为试卷列表
      const exams = favorites.map((favorite) => {
        const exam = favorite.examPaper;
        const questionsCount = exam.examQuestions.length;
        const { examQuestions, ...examData } = exam;

        return {
          ...examData,
          questionsCount,
          favoriteCreatedAt: favorite.createdAt,
        };
      });

      this.logger.log(`查询结果: 共 ${exams.length} 条记录, 总数 ${total}`);

      return {
        items: exams,
        total,
        page,
        pageSize,
      };
    } catch (error) {
      this.logger.error(`获取用户收藏列表失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 从收藏的试卷中抽题组成专属试卷
   * @param createPrivateExamDto 创建专属试卷参数
   * @param userId 用户ID
   */
  async createPrivateExam(
    createPrivateExamDto: CreatePrivateExamDto,
    userId: number,
  ) {
    this.logger.log(
      `创建专属试卷, 参数: ${JSON.stringify(createPrivateExamDto)}, 用户: ${userId}`,
    );

    try {
      // 检查用户是否为面试官角色
      const user = await this.prisma.frontUser.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('用户不存在');
      }

      if (user.role !== 'INTERVIEWER') {
        throw new ForbiddenException('只有面试官可以创建专属试卷');
      }

      // 验证分类存在
      await this.checkCategoryExists(createPrivateExamDto.categoryId);

      // 验证二级分类存在（如果提供）
      if (createPrivateExamDto.subCategoryId) {
        await this.checkSubCategoryExists(createPrivateExamDto.subCategoryId);
      }

      // 验证用户是否已收藏了指定的试卷
      const { favoriteExamIds, questionsPerExam = 10 } = createPrivateExamDto;

      // 查询用户收藏的试卷
      const favorites = await this.prisma.favorite.findMany({
        where: {
          userId,
          examPaperId: { in: favoriteExamIds },
          deletedAt: null,
        },
        include: {
          examPaper: {
            include: {
              examQuestions: {
                where: { deletedAt: null },
                include: { question: true },
              },
            },
          },
        },
      });

      if (favorites.length === 0) {
        throw new BadRequestException('未找到指定的收藏试卷');
      }

      // 确认所有指定的收藏试卷都存在
      const foundExamIds = favorites.map((fav) => fav.examPaperId);
      const missingExamIds = favoriteExamIds.filter(
        (id) => !foundExamIds.includes(id),
      );

      if (missingExamIds.length > 0) {
        throw new BadRequestException(
          `未找到或未收藏以下试卷: ${missingExamIds.join(', ')}`,
        );
      }

      // 从每个收藏的试卷中随机抽取题目
      let allSelectedQuestions = [];

      for (const favorite of favorites) {
        const examQuestions = favorite.examPaper.examQuestions;

        // 如果试卷题目数量小于要抽取的数量，则全部选择
        const numToSelect = Math.min(questionsPerExam, examQuestions.length);

        // 随机选择题目
        const selectedQuestions = this.getRandomQuestions(
          examQuestions,
          numToSelect,
        );
        allSelectedQuestions = [...allSelectedQuestions, ...selectedQuestions];
      }

      // 创建专属试卷
      const newExam = await this.prisma.examPaper.create({
        data: {
          name: createPrivateExamDto.name,
          description: createPrivateExamDto.description,
          categoryId: createPrivateExamDto.categoryId,
          subCategoryId: createPrivateExamDto.subCategoryId,
          userId,
          isPublic: false, // 专属试卷不公开
        },
      });

      // 添加题目到专属试卷
      const examQuestionsData = allSelectedQuestions.map((q, index) => ({
        examId: newExam.id,
        questionId: q.question.id,
        order: index + 1,
        score: 1, // 默认每题1分
      }));

      // 批量插入题目关联
      await this.prisma.examQuestion.createMany({
        data: examQuestionsData,
      });

      // 返回创建的专属试卷
      const createdExam = await this.prisma.examPaper.findUnique({
        where: { id: newExam.id },
        include: {
          category: true,
          subCategory: true,
          user: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
          examQuestions: {
            include: {
              question: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      this.logger.log(
        `专属试卷创建成功: ${newExam.id}, 包含 ${examQuestionsData.length} 道题目`,
      );

      return createdExam;
    } catch (error) {
      this.logger.error(`创建专属试卷失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 从题目列表中随机选择指定数量的题目
   * @param questions 题目列表
   * @param count 要选择的数量
   */
  private getRandomQuestions(questions: any[], count: number) {
    // 复制题目数组，避免修改原数组
    const questionsCopy = [...questions];
    const selected = [];

    // 随机选择题目
    while (selected.length < count && questionsCopy.length > 0) {
      const randomIndex = Math.floor(Math.random() * questionsCopy.length);
      selected.push(questionsCopy[randomIndex]);
      questionsCopy.splice(randomIndex, 1);
    }

    return selected;
  }

  /**
   * 获取HR的专属试卷列表
   * @param userId HR用户ID
   * @param queryExamDto 查询参数
   */
  async getPrivateExams(userId: number, queryExamDto: QueryExamDto) {
    this.logger.log(
      `获取专属试卷列表, 用户: ${userId}, 参数: ${JSON.stringify(queryExamDto)}`,
    );

    try {
      const {
        page = 1,
        pageSize = 10,
        keyword,
        sortField = ExamSortField.CREATED_AT,
        sortOrder = 'desc',
      } = queryExamDto;

      const skip = (page - 1) * pageSize;

      // 构建查询条件
      const where: any = {
        deletedAt: null,
        isPublic: false, // 只返回不公开的试卷
        userId, // 只返回当前用户创建的
      };

      if (keyword) {
        where.OR = [
          { name: { contains: keyword } },
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
            _count: {
              select: {
                examQuestions: {
                  where: { deletedAt: null },
                },
              },
            },
          },
        }),
        this.prisma.examPaper.count({ where }),
      ]);

      // 处理返回数据，添加题目总数等信息
      const enrichedExams = exams.map((exam) => {
        const questionsCount = exam._count.examQuestions;
        // 从_count中移除examQuestions详情以减小数据量
        const { _count, ...examData } = exam;

        return {
          ...examData,
          questionsCount, // 添加题目总数
        };
      });

      this.logger.log(
        `查询结果: 共 ${enrichedExams.length} 条记录, 总数 ${total}`,
      );

      return {
        items: enrichedExams,
        total,
        page,
        pageSize,
      };
    } catch (error) {
      this.logger.error(`获取专属试卷列表失败: ${error.message}`);
      throw error;
    }
  }
}
