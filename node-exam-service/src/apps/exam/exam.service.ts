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
import {
  QueryUserFavoritesDto,
  FavoriteSortField,
} from './dto/query-user-favorites.dto';

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
        // this.logger.log(`移除question详情: ${examQuestions}`);
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
   * 创建分类
   * @param createCategoryDto 分类数据
   * @returns 创建的分类
   */
  async createCategory(createCategoryDto: any) {
    this.logger.log(`创建分类: ${createCategoryDto.name}`);

    try {
      // 检查分类名称是否已存在
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          name: createCategoryDto.name,
          deletedAt: null,
        },
      });

      if (existingCategory) {
        throw new BadRequestException(
          `分类名称 "${createCategoryDto.name}" 已存在`,
        );
      }

      // 创建分类
      const category = await this.prisma.category.create({
        data: {
          name: createCategoryDto.name,
          description: createCategoryDto.description,
        },
      });

      this.logger.log(`分类创建成功: ${category.id}`);
      return category;
    } catch (error) {
      this.logger.error(`创建分类失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 更新分类
   * @param id 分类ID
   * @param updateCategoryDto 更新数据
   * @returns 更新后的分类
   */
  async updateCategory(id: number, updateCategoryDto: any) {
    this.logger.log(`更新分类: ${id}`);

    try {
      // 检查分类是否存在
      const category = await this.prisma.category.findUnique({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!category) {
        throw new NotFoundException(`分类不存在: ${id}`);
      }

      // 如果更新名称，检查名称是否已被其他分类使用
      if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
        const existingCategory = await this.prisma.category.findFirst({
          where: {
            name: updateCategoryDto.name,
            id: { not: id },
            deletedAt: null,
          },
        });

        if (existingCategory) {
          throw new BadRequestException(
            `分类名称 "${updateCategoryDto.name}" 已存在`,
          );
        }
      }

      // 更新分类
      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: {
          name: updateCategoryDto.name,
          description: updateCategoryDto.description,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`分类更新成功: ${id}`);
      return updatedCategory;
    } catch (error) {
      this.logger.error(`更新分类失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 删除分类
   * @param id 分类ID
   */
  async deleteCategory(id: number) {
    this.logger.log(`删除分类: ${id}`);

    try {
      // 检查分类是否存在
      const category = await this.prisma.category.findUnique({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          subCategories: {
            where: {
              deletedAt: null,
            },
          },
          examPapers: {
            where: {
              deletedAt: null,
            },
          },
        },
      });

      if (!category) {
        throw new NotFoundException(`分类不存在: ${id}`);
      }

      // 检查是否有关联的子分类
      if (category.subCategories.length > 0) {
        throw new BadRequestException(
          `无法删除分类，该分类下有 ${category.subCategories.length} 个子分类`,
        );
      }

      // 检查是否有关联的试卷
      if (category.examPapers.length > 0) {
        throw new BadRequestException(
          `无法删除分类，该分类下有 ${category.examPapers.length} 个试卷`,
        );
      }

      // 软删除分类
      await this.prisma.category.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      this.logger.log(`分类删除成功: ${id}`);
    } catch (error) {
      this.logger.error(`删除分类失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 创建子分类
   * @param createSubCategoryDto 子分类数据
   * @returns 创建的子分类
   */
  async createSubCategory(createSubCategoryDto: any) {
    this.logger.log(
      `创建子分类: ${createSubCategoryDto.name}, 所属分类ID: ${createSubCategoryDto.categoryId}`,
    );

    try {
      // 检查父分类是否存在
      const parentCategory = await this.prisma.category.findUnique({
        where: {
          id: createSubCategoryDto.categoryId,
          deletedAt: null,
        },
      });

      if (!parentCategory) {
        throw new NotFoundException(
          `父分类不存在: ${createSubCategoryDto.categoryId}`,
        );
      }

      // 检查子分类名称是否已存在于同一父分类下
      const existingSubCategory = await this.prisma.subCategory.findFirst({
        where: {
          name: createSubCategoryDto.name,
          categoryId: createSubCategoryDto.categoryId,
          deletedAt: null,
        },
      });

      if (existingSubCategory) {
        throw new BadRequestException(
          `子分类名称 "${createSubCategoryDto.name}" 在该父分类下已存在`,
        );
      }

      // 创建子分类
      const subCategory = await this.prisma.subCategory.create({
        data: {
          name: createSubCategoryDto.name,
          description: createSubCategoryDto.description,
          categoryId: createSubCategoryDto.categoryId,
        },
      });

      this.logger.log(`子分类创建成功: ${subCategory.id}`);
      return subCategory;
    } catch (error) {
      this.logger.error(`创建子分类失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 更新子分类
   * @param id 子分类ID
   * @param updateSubCategoryDto 更新数据
   * @returns 更新后的子分类
   */
  async updateSubCategory(id: number, updateSubCategoryDto: any) {
    this.logger.log(`更新子分类: ${id}`);

    try {
      // 检查子分类是否存在
      const subCategory = await this.prisma.subCategory.findUnique({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!subCategory) {
        throw new NotFoundException(`子分类不存在: ${id}`);
      }

      // 如果更新父分类ID，检查父分类是否存在
      if (
        updateSubCategoryDto.categoryId &&
        updateSubCategoryDto.categoryId !== subCategory.categoryId
      ) {
        const parentCategory = await this.prisma.category.findUnique({
          where: {
            id: updateSubCategoryDto.categoryId,
            deletedAt: null,
          },
        });

        if (!parentCategory) {
          throw new NotFoundException(
            `父分类不存在: ${updateSubCategoryDto.categoryId}`,
          );
        }
      }

      // 如果更新名称，检查名称是否已被同一父分类下的其他子分类使用
      if (
        updateSubCategoryDto.name &&
        updateSubCategoryDto.name !== subCategory.name
      ) {
        const categoryId =
          updateSubCategoryDto.categoryId || subCategory.categoryId;
        const existingSubCategory = await this.prisma.subCategory.findFirst({
          where: {
            name: updateSubCategoryDto.name,
            categoryId,
            id: { not: id },
            deletedAt: null,
          },
        });

        if (existingSubCategory) {
          throw new BadRequestException(
            `子分类名称 "${updateSubCategoryDto.name}" 在该父分类下已存在`,
          );
        }
      }

      // 更新子分类
      const updatedSubCategory = await this.prisma.subCategory.update({
        where: { id },
        data: {
          name: updateSubCategoryDto.name,
          description: updateSubCategoryDto.description,
          categoryId: updateSubCategoryDto.categoryId,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`子分类更新成功: ${id}`);
      return updatedSubCategory;
    } catch (error) {
      this.logger.error(`更新子分类失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 删除子分类
   * @param id 子分类ID
   */
  async deleteSubCategory(id: number) {
    this.logger.log(`删除子分类: ${id}`);

    try {
      // 检查子分类是否存在
      const subCategory = await this.prisma.subCategory.findUnique({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          examPapers: {
            where: {
              deletedAt: null,
            },
          },
        },
      });

      if (!subCategory) {
        throw new NotFoundException(`子分类不存在: ${id}`);
      }

      // 检查是否有关联的试卷
      if (subCategory.examPapers.length > 0) {
        throw new BadRequestException(
          `无法删除子分类，该子分类下有 ${subCategory.examPapers.length} 个试卷`,
        );
      }

      // 软删除子分类
      await this.prisma.subCategory.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      this.logger.log(`子分类删除成功: ${id}`);
    } catch (error) {
      this.logger.error(`删除子分类失败: ${error.message}`);
      throw error;
    }
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
   * 获取用户收藏列表
   * @param userId 用户ID
   * @param queryFavoritesDto 查询参数
   * @returns 试卷列表和总数
   */
  async getUserFavorites(
    userId: number,
    queryFavoritesDto: QueryUserFavoritesDto,
  ) {
    this.logger.log(
      `获取用户 ${userId} 的收藏列表, 参数: ${JSON.stringify(queryFavoritesDto)}`,
    );

    try {
      // 解构查询参数，并设置默认值
      const {
        page = 1,
        pageSize = 10,
        sortField = FavoriteSortField.FAVORITE_CREATED_AT,
        sortOrder = 'desc',
      } = queryFavoritesDto;

      const skip = (page - 1) * pageSize;

      // 构建查询条件
      const where = {
        deletedAt: null,
        userId,
        examPaper: {
          deletedAt: null,
        },
      };

      this.logger.log(`执行收藏查询, 查询条件: ${JSON.stringify(where)}`);

      // 获取收藏数量
      const total = await this.prisma.favorite.count({ where });

      // 获取收藏列表 - 根据sortField确定排序方式
      const favorites = await this.prisma.favorite.findMany({
        where,
        skip,
        take: pageSize,
        orderBy:
          sortField === FavoriteSortField.CREATED_AT
            ? { examPaper: { createdAt: sortOrder } } // 按试卷创建时间排序
            : { createdAt: sortOrder }, // 按收藏时间排序
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
              },
            },
          },
        },
      });

      // 处理返回数据，格式化为试卷列表
      const exams = favorites
        .map((favorite) => {
          // 确保examPaper存在
          if (!favorite.examPaper) {
            return null;
          }

          const questionsCount = favorite.examPaper.examQuestions?.length || 0;

          // 提取考卷数据，移除examQuestions减小数据量
          const { examQuestions, ...examData } = favorite.examPaper;

          return {
            ...examData,
            questionsCount,
            favoriteCreatedAt: favorite.createdAt,
          };
        })
        .filter(Boolean); // 过滤掉null项

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
        this.logger.log(_count); // 打印每个exam的信息，用于调试和ap
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

  /**
   * 获取面试官的专属试卷列表 - 无需授权，只需要面试官ID
   * @param interviewerId 面试官用户ID
   * @param queryExamDto 查询参数
   */
  async getInterviewerPrivateExams(
    interviewerId: number,
    queryExamDto: QueryExamDto,
  ) {
    this.logger.log(
      `获取面试官专属试卷列表, 面试官ID: ${interviewerId}, 参数: ${JSON.stringify(queryExamDto)}`,
    );

    try {
      // 首先验证interviewerId是否是面试官
      const interviewer = await this.prisma.frontUser.findFirst({
        where: {
          id: interviewerId,
          role: 'INTERVIEWER',
          deletedAt: null,
        },
      });

      if (!interviewer) {
        throw new NotFoundException(`ID为${interviewerId}的面试官不存在`);
      }

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
        userId: interviewerId, // 只返回指定面试官创建的试卷
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
      this.logger.error(`获取面试官专属试卷列表失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取专属试卷详情
   * @param id 试卷ID
   */
  async getPrivateExamDetail(id: number) {
    this.logger.log(`获取专属试卷详情, 试卷ID: ${id}`);

    try {
      // 查询试卷，包括分类、创建者、题目等信息
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
              role: true,
            },
          },
          examQuestions: {
            where: { deletedAt: null },
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
        throw new NotFoundException(`ID为${id}的试卷不存在`);
      }

      this.logger.log(`获取到试卷详情, 试卷名称: ${exam.name}`);

      return exam;
    } catch (error) {
      this.logger.error(`获取专属试卷详情失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 验证考试邀请码
   * @param invitationCode 邀请码
   */
  async verifyInvitationCode(invitationCode: string) {
    this.logger.log(`验证考试邀请码: ${invitationCode}`);

    // 查询邀请码对应的考试分配记录
    const assignment = await this.prisma.examAssignment.findFirst({
      where: {
        invitationCode,
      },
      include: {
        examPaper: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('邀请码无效');
    }

    if (assignment.completed) {
      throw new BadRequestException('该考试已完成，不能重复进入');
    }

    // 检查考试时间是否在有效范围内
    const now = new Date();
    const examStartTime = assignment.examStartTime;
    const examEndTime = assignment.examEndTime;

    // 判断当前时间是否在考试时间范围内
    const canStart = now >= examStartTime && now <= examEndTime;

    return {
      examId: assignment.examId,
      examTitle: assignment.examPaper?.name,
      note: assignment.note,
      duration: assignment.duration,
      canStart,
      examStartTime,
      examEndTime,
    };
  }

  /**
   * 开始考试并获取试卷内容
   * @param invitationCode 邀请码
   */
  async startExam(invitationCode: string) {
    this.logger.log(`开始考试: ${invitationCode}`);

    // 验证邀请码并获取考试信息
    const verifyResult = await this.verifyInvitationCode(invitationCode);

    if (!verifyResult.canStart) {
      throw new BadRequestException('当前不在考试时间范围内');
    }

    // 获取试卷详情
    const exam = await this.getExamDetail(verifyResult.examId);

    // 获取考试分配记录
    const assignment = await this.prisma.examAssignment.findFirst({
      where: {
        invitationCode,
      },
    });

    if (!assignment) {
      throw new NotFoundException('邀请码无效');
    }

    // 整理返回数据，移除答案
    const questions = exam.examQuestions.map((eq) => {
      const { question } = eq;
      return {
        id: question.id,
        qtype: question.qtype,
        question: question.question,
        options: question.options,
        score: eq.score,
        // 移除答案和解析
        answer: undefined,
        ai_analysis: undefined,
      };
    });

    return {
      examId: exam.id,
      examTitle: exam.name,
      questions,
      duration: verifyResult.duration,
      examStartTime: assignment.examStartTime,
      examEndTime: assignment.examEndTime,
    };
  }

  /**
   * 提交考试答案
   * @param invitationCode 邀请码
   * @param answers 考生答案
   */
  async submitExam(invitationCode: string, answers: Record<string, any>) {
    this.logger.log(`提交考试答案: ${invitationCode}`);

    // 查询邀请码对应的考试分配记录
    const assignment = await this.prisma.examAssignment.findFirst({
      where: {
        invitationCode,
      },
      include: {
        examPaper: {
          include: {
            examQuestions: {
              include: {
                question: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('邀请码无效');
    }

    if (assignment.completed) {
      throw new BadRequestException('该考试已完成，不能重复提交');
    }

    // 检查考试时间是否已结束
    const now = new Date();
    if (assignment.examEndTime && now > assignment.examEndTime) {
      throw new BadRequestException('考试时间已结束，无法提交');
    }

    // 计算得分
    let totalScore = 0;
    let earnedScore = 0;

    // 遍历试卷中的每个题目
    if (assignment.examPaper?.examQuestions) {
      for (const examQuestion of assignment.examPaper.examQuestions) {
        const questionId = examQuestion.questionId.toString();
        const question = examQuestion.question;
        const score = examQuestion.score;

        totalScore += score;

        // 检查答案是否正确
        if (questionId in answers) {
          const userAnswer = answers[questionId];
          let isCorrect = false;

          switch (question.qtype) {
            case 1: // 单选题
              isCorrect = userAnswer === question.answer;
              break;
            case 2: // 多选题
              // 将答案排序后比较
              const correctAnswers = question.answer
                .split(',')
                .sort()
                .join(',');
              const userAnswers = Array.isArray(userAnswer)
                ? [...userAnswer].sort().join(',')
                : userAnswer;
              isCorrect = userAnswers === correctAnswers;
              break;
            case 3: // 判断题
              isCorrect = userAnswer.toString() === question.answer;
              break;
            case 4: // 填空题
              isCorrect = userAnswer === question.answer;
              break;
            default:
              break;
          }

          if (isCorrect) {
            earnedScore += score;
          }
        }
      }
    }

    // 计算百分比
    const percentage = Math.round((earnedScore / totalScore) * 100);

    // 更新考试状态
    await this.prisma.examAssignment.update({
      where: { id: assignment.id },
      data: {
        score: earnedScore,
        status: 'COMPLETED',
        completed: true,
        answers: answers as any,
      },
    });

    return {
      score: earnedScore,
      totalScore,
      percentage,
    };
  }

  // 获取用户的考试列表
  async getUserExams(userId: number, query: any) {
    const { page = 1, pageSize = 10 } = query;
    const skip = (page - 1) * pageSize;

    try {
      // 查询条件：查找指定用户ID相关的考试
      const where = {
        application: {
          jobSeeker: {
            user: {
              id: userId,
            },
          },
        },
      };

      // 查询用户的考试列表及总数
      const [assignments, total] = await Promise.all([
        this.prisma.examAssignment.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            examPaper: true,
            application: {
              include: {
                jobSeeker: true,
                job: {
                  include: {
                    company: true,
                  },
                },
              },
            },
          },
        }),
        this.prisma.examAssignment.count({ where }),
      ]);

      // 获取所有相关的面试官信息
      const interviewerIds = assignments
        .filter((assignment) => assignment.application?.job?.interviewerId)
        .map((assignment) => assignment.application?.job?.interviewerId);

      // 如果有面试官ID，查询面试官详情
      let interviewers = [];
      if (interviewerIds.length > 0) {
        interviewers = await this.prisma.interviewer.findMany({
          where: {
            id: {
              in: interviewerIds,
            },
          },
          include: {
            user: true,
          },
        });
      }

      // 格式化返回数据
      const formattedItems = assignments.map((assignment) => {
        // 获取关联实体数据（如果存在）
        const job = assignment.application?.job;
        const company = job?.company;

        // 查找对应的面试官
        const interviewer = job?.interviewerId
          ? interviewers.find((i) => i.id === job.interviewerId)
          : null;

        // 计算截止时间（考试开始时间 + 时长）
        const endDateTime = assignment.examEndTime;

        // 判断考试状态
        let status = assignment.status;
        if (status === 'PENDING' && new Date() > assignment.examEndTime) {
          status = 'EXPIRED'; // 如果超过了考试截止时间，则标记为过期
        }

        return {
          id: assignment.id,
          examId: assignment.examId,
          examTitle: assignment.examPaper?.name,
          status: status,
          score: assignment.score,
          duration: assignment.duration,
          startTime: assignment.examStartTime,
          endTime: endDateTime,
          submittedAt: assignment.completed ? assignment.updatedAt : null,
          invitationCode: assignment.invitationCode,
          companyId: company?.id,
          companyName: company?.name,
          positionId: job?.id,
          positionName: job?.title,
          interviewerId: interviewer?.id,
          interviewerName: interviewer?.user?.username,
        };
      });

      return { items: formattedItems, total };
    } catch (error) {
      this.logger.error(`获取用户考试列表失败: ${error.message}`, error.stack);
      throw new Error('获取用户考试列表失败');
    }
  }
}
