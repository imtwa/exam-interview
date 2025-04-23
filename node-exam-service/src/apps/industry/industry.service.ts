import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '../../../prisma/generated/client';
import { LoggerService } from '../../common/logger/logger.service';
import { CreateIndustryCategoryDto } from './dto/create-industry-category.dto';
import { UpdateIndustryCategoryDto } from './dto/update-industry-category.dto';
import { CreateIndustrySubCategoryDto } from './dto/create-industry-subcategory.dto';
import { UpdateIndustrySubCategoryDto } from './dto/update-industry-subcategory.dto';
import { QueryIndustryDto } from './dto/query-industry.dto';

@Injectable()
export class IndustryService {
  private readonly logger: LoggerService;

  constructor(
    @Inject('PRISMA_CLIENT')
    private prisma: PrismaClient,
    private loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext('IndustryService');
  }

  /**
   * 创建行业一级分类
   * @param createIndustryCategoryDto 行业分类数据
   * @returns 创建的行业分类
   */
  async createCategory(createIndustryCategoryDto: CreateIndustryCategoryDto) {
    try {
      const category = await this.prisma.industryCategory.create({
        data: {
          name: createIndustryCategoryDto.name,
          description: createIndustryCategoryDto.description,
        },
      });
      return category;
    } catch (error) {
      this.logger.error(`创建行业分类失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 更新行业一级分类
   * @param id 分类ID
   * @param updateIndustryCategoryDto 更新数据
   * @returns 更新后的分类
   */
  async updateCategory(
    id: number,
    updateIndustryCategoryDto: UpdateIndustryCategoryDto,
  ) {
    try {
      // 检查是否存在该分类
      const exists = await this.prisma.industryCategory.findUnique({
        where: { id, deletedAt: null },
      });

      if (!exists) {
        throw new NotFoundException(`行业分类ID:${id}不存在`);
      }

      return await this.prisma.industryCategory.update({
        where: { id },
        data: {
          ...updateIndustryCategoryDto,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`更新行业分类失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 删除行业一级分类
   * @param id 分类ID
   */
  async removeCategory(id: number) {
    try {
      // 检查是否存在该分类
      const exists = await this.prisma.industryCategory.findUnique({
        where: { id, deletedAt: null },
      });

      if (!exists) {
        throw new NotFoundException(`行业分类ID:${id}不存在`);
      }

      // 检查是否存在关联的二级分类
      const hasSubCategories = await this.prisma.industrySubCategory.count({
        where: { categoryId: id, deletedAt: null },
      });

      if (hasSubCategories > 0) {
        throw new BadRequestException(
          `行业分类ID:${id}下存在${hasSubCategories}个二级分类，无法删除`,
        );
      }

      // 使用软删除
      await this.prisma.industryCategory.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      this.logger.error(`删除行业分类失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 获取分页的行业一级分类列表
   * @param query 查询参数
   * @returns 分类列表和总数
   */
  async findAllCategories(query: QueryIndustryDto) {
    try {
      const { page = 1, pageSize = 10, keyword } = query;
      const skip = (page - 1) * pageSize;

      // 构建查询条件
      const where: any = {
        deletedAt: null,
      };

      if (keyword) {
        where.OR = [
          { name: { contains: keyword } },
          { description: { contains: keyword } },
        ];
      }

      // 查询总数和分类列表
      const [categories, total] = await Promise.all([
        this.prisma.industryCategory.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            subCategories: {
              where: { deletedAt: null },
              select: { id: true, name: true },
            },
          },
        }),
        this.prisma.industryCategory.count({ where }),
      ]);

      return { categories, total };
    } catch (error) {
      this.logger.error(`获取行业分类列表失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 获取单个行业一级分类详情
   * @param id 分类ID
   * @returns 分类详情
   */
  async findOneCategory(id: number) {
    try {
      const category = await this.prisma.industryCategory.findUnique({
        where: { id, deletedAt: null },
        include: {
          subCategories: {
            where: { deletedAt: null },
          },
        },
      });

      if (!category) {
        throw new NotFoundException(`行业分类ID:${id}不存在`);
      }

      return category;
    } catch (error) {
      this.logger.error(`获取行业分类详情失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 创建行业二级分类
   * @param createSubCategoryDto 二级分类数据
   * @returns 创建的二级分类
   */
  async createSubCategory(createSubCategoryDto: CreateIndustrySubCategoryDto) {
    try {
      // 检查一级分类是否存在
      const categoryExists = await this.prisma.industryCategory.findUnique({
        where: {
          id: createSubCategoryDto.categoryId,
          deletedAt: null,
        },
      });

      if (!categoryExists) {
        throw new NotFoundException(
          `行业一级分类ID:${createSubCategoryDto.categoryId}不存在`,
        );
      }

      const subCategory = await this.prisma.industrySubCategory.create({
        data: {
          name: createSubCategoryDto.name,
          description: createSubCategoryDto.description,
          categoryId: createSubCategoryDto.categoryId,
        },
      });

      return subCategory;
    } catch (error) {
      this.logger.error(`创建行业二级分类失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 更新行业二级分类
   * @param id 二级分类ID
   * @param updateSubCategoryDto 更新数据
   * @returns 更新后的二级分类
   */
  async updateSubCategory(
    id: number,
    updateSubCategoryDto: UpdateIndustrySubCategoryDto,
  ) {
    try {
      // 检查二级分类是否存在
      const exists = await this.prisma.industrySubCategory.findUnique({
        where: { id, deletedAt: null },
      });

      if (!exists) {
        throw new NotFoundException(`行业二级分类ID:${id}不存在`);
      }

      // 如果更新了一级分类ID，检查一级分类是否存在
      if (
        updateSubCategoryDto.categoryId &&
        updateSubCategoryDto.categoryId !== exists.categoryId
      ) {
        const categoryExists = await this.prisma.industryCategory.findUnique({
          where: {
            id: updateSubCategoryDto.categoryId,
            deletedAt: null,
          },
        });

        if (!categoryExists) {
          throw new NotFoundException(
            `行业一级分类ID:${updateSubCategoryDto.categoryId}不存在`,
          );
        }
      }

      return await this.prisma.industrySubCategory.update({
        where: { id },
        data: {
          ...updateSubCategoryDto,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`更新行业二级分类失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 删除行业二级分类
   * @param id 二级分类ID
   */
  async removeSubCategory(id: number) {
    try {
      // 检查二级分类是否存在
      const exists = await this.prisma.industrySubCategory.findUnique({
        where: { id, deletedAt: null },
      });

      if (!exists) {
        throw new NotFoundException(`行业二级分类ID:${id}不存在`);
      }

      // 检查是否有关联的职位
      const hasJobs = await this.prisma.jobPosting.count({
        where: { subCategoryId: id, deletedAt: null },
      });

      if (hasJobs > 0) {
        throw new BadRequestException(
          `行业二级分类ID:${id}下存在${hasJobs}个职位，无法删除`,
        );
      }

      // 使用软删除
      await this.prisma.industrySubCategory.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      this.logger.error(`删除行业二级分类失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 根据一级分类ID获取二级分类列表
   * @param categoryId 一级分类ID
   * @returns 二级分类列表
   */
  async findSubCategories(categoryId: number) {
    try {
      // 检查一级分类是否存在
      const categoryExists = await this.prisma.industryCategory.findUnique({
        where: {
          id: categoryId,
          deletedAt: null,
        },
      });

      if (!categoryExists) {
        throw new NotFoundException(`行业一级分类ID:${categoryId}不存在`);
      }

      const subCategories = await this.prisma.industrySubCategory.findMany({
        where: {
          categoryId,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });

      return subCategories;
    } catch (error) {
      this.logger.error(`获取行业二级分类列表失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 获取单个行业二级分类详情
   * @param id 二级分类ID
   * @returns 二级分类详情
   */
  async findOneSubCategory(id: number) {
    try {
      const subCategory = await this.prisma.industrySubCategory.findUnique({
        where: { id, deletedAt: null },
        include: {
          category: true,
        },
      });

      if (!subCategory) {
        throw new NotFoundException(`行业二级分类ID:${id}不存在`);
      }

      return subCategory;
    } catch (error) {
      this.logger.error(`获取行业二级分类详情失败: ${error.message}`, error);
      throw error;
    }
  }
}
