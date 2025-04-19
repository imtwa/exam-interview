import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  PrismaClient,
  IndustryCategory,
  IndustrySubCategory,
} from '../../../../prisma/generated/client';
import { CreateIndustryCategoryDto } from '../dto/industry/create-industry-category.dto';
import { UpdateIndustryCategoryDto } from '../dto/industry/update-industry-category.dto';
import { CreateIndustrySubCategoryDto } from '../dto/industry/create-industry-subcategory.dto';
import { UpdateIndustrySubCategoryDto } from '../dto/industry/update-industry-subcategory.dto';
import { LoggerService } from '../../../common/logger/logger.service';

@Injectable()
export class IndustryService {
  private readonly logger: LoggerService;

  constructor(
    @Inject('PRISMA_CLIENT') private prisma: PrismaClient,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext(IndustryService.name);
  }

  /**
   * 获取所有行业分类（可选是否包含子分类）
   */
  async getAllCategories(includeSubcategories: boolean = true) {
    try {
      const categories = await this.prisma.industryCategory.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          name: 'asc',
        },
        include: includeSubcategories
          ? {
              subCategories: {
                where: {
                  deletedAt: null,
                },
                orderBy: {
                  name: 'asc',
                },
              },
            }
          : undefined,
      });

      return categories;
    } catch (error) {
      this.logger.error(`获取行业分类失败: ${error.message}`, error);
      throw new BadRequestException('获取行业分类失败');
    }
  }

  /**
   * 根据ID获取行业分类详情
   */
  async getCategoryById(id: number): Promise<IndustryCategory> {
    try {
      const category = await this.prisma.industryCategory.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          subCategories: {
            where: {
              deletedAt: null,
            },
            orderBy: {
              name: 'asc',
            },
          },
        },
      });

      if (!category) {
        throw new NotFoundException(`行业分类不存在 ID: ${id}`);
      }

      return category;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`获取行业分类详情失败: ${error.message}`, error);
      throw new BadRequestException('获取行业分类详情失败');
    }
  }

  /**
   * 创建行业分类
   */
  async createCategory(
    createCategoryDto: CreateIndustryCategoryDto,
  ): Promise<IndustryCategory> {
    try {
      // 检查名称是否已存在
      const existingCategory = await this.prisma.industryCategory.findFirst({
        where: {
          name: createCategoryDto.name,
          deletedAt: null,
        },
      });

      if (existingCategory) {
        throw new BadRequestException(
          `行业分类 '${createCategoryDto.name}' 已存在`,
        );
      }

      const category = await this.prisma.industryCategory.create({
        data: createCategoryDto,
      });

      this.logger.log(`创建行业分类成功 ID: ${category.id}`);

      return category;
    } catch (error) {
      this.logger.error(`创建行业分类失败: ${error.message}`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('创建行业分类失败');
    }
  }

  /**
   * 更新行业分类
   */
  async updateCategory(
    id: number,
    updateCategoryDto: UpdateIndustryCategoryDto,
  ): Promise<IndustryCategory> {
    try {
      // 检查分类是否存在
      const existingCategory = await this.prisma.industryCategory.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!existingCategory) {
        throw new NotFoundException(`行业分类不存在 ID: ${id}`);
      }

      // 如果更新名称，检查名称是否已被其他分类使用
      if (
        updateCategoryDto.name &&
        updateCategoryDto.name !== existingCategory.name
      ) {
        const duplicateName = await this.prisma.industryCategory.findFirst({
          where: {
            name: updateCategoryDto.name,
            id: { not: id },
            deletedAt: null,
          },
        });

        if (duplicateName) {
          throw new BadRequestException(
            `行业分类名称 '${updateCategoryDto.name}' 已被使用`,
          );
        }
      }

      const category = await this.prisma.industryCategory.update({
        where: { id },
        data: updateCategoryDto,
      });

      this.logger.log(`更新行业分类成功 ID: ${id}`);

      return category;
    } catch (error) {
      this.logger.error(`更新行业分类失败: ${error.message}`, error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('更新行业分类失败');
    }
  }

  /**
   * 删除行业分类（软删除）
   */
  async deleteCategory(id: number): Promise<void> {
    try {
      // 检查分类是否存在
      const existingCategory = await this.prisma.industryCategory.findFirst({
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
        },
      });

      if (!existingCategory) {
        throw new NotFoundException(`行业分类不存在 ID: ${id}`);
      }

      // 检查是否有关联的子分类
      if (existingCategory.subCategories.length > 0) {
        throw new BadRequestException(
          '无法删除含有子分类的行业分类，请先删除所有子分类',
        );
      }

      // 软删除行业分类
      await this.prisma.industryCategory.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      this.logger.log(`删除行业分类成功 ID: ${id}`);
    } catch (error) {
      this.logger.error(`删除行业分类失败: ${error.message}`, error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('删除行业分类失败');
    }
  }

  /**
   * 获取行业分类下的所有子分类
   */
  async getSubcategories(categoryId: number): Promise<IndustrySubCategory[]> {
    try {
      // 检查分类是否存在
      const existingCategory = await this.prisma.industryCategory.findFirst({
        where: {
          id: categoryId,
          deletedAt: null,
        },
      });

      if (!existingCategory) {
        throw new NotFoundException(`行业分类不存在 ID: ${categoryId}`);
      }

      const subcategories = await this.prisma.industrySubCategory.findMany({
        where: {
          categoryId,
          deletedAt: null,
        },
        orderBy: {
          name: 'asc',
        },
      });

      return subcategories;
    } catch (error) {
      this.logger.error(`获取子分类失败: ${error.message}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('获取子分类失败');
    }
  }

  /**
   * 创建行业子分类
   */
  async createSubcategory(
    categoryId: number,
    createSubcategoryDto: CreateIndustrySubCategoryDto,
  ): Promise<IndustrySubCategory> {
    try {
      // 检查父分类是否存在
      const parentCategory = await this.prisma.industryCategory.findFirst({
        where: {
          id: categoryId,
          deletedAt: null,
        },
      });

      if (!parentCategory) {
        throw new NotFoundException(`行业分类不存在 ID: ${categoryId}`);
      }

      // 检查名称是否已存在于同一父分类下
      const existingSubcategory =
        await this.prisma.industrySubCategory.findFirst({
          where: {
            categoryId,
            name: createSubcategoryDto.name,
            deletedAt: null,
          },
        });

      if (existingSubcategory) {
        throw new BadRequestException(
          `该分类下已存在名为 '${createSubcategoryDto.name}' 的子分类`,
        );
      }

      const subcategory = await this.prisma.industrySubCategory.create({
        data: {
          ...createSubcategoryDto,
          categoryId,
        },
      });

      this.logger.log(`创建子分类成功 ID: ${subcategory.id}`);

      return subcategory;
    } catch (error) {
      this.logger.error(`创建子分类失败: ${error.message}`, error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('创建子分类失败');
    }
  }

  /**
   * 更新行业子分类
   */
  async updateSubcategory(
    id: number,
    updateSubcategoryDto: UpdateIndustrySubCategoryDto,
  ): Promise<IndustrySubCategory> {
    try {
      // 检查子分类是否存在
      const existingSubcategory =
        await this.prisma.industrySubCategory.findFirst({
          where: {
            id,
            deletedAt: null,
          },
        });

      if (!existingSubcategory) {
        throw new NotFoundException(`子分类不存在 ID: ${id}`);
      }

      // 如果要更改所属分类，检查新的父分类是否存在
      if (
        updateSubcategoryDto.categoryId &&
        updateSubcategoryDto.categoryId !== existingSubcategory.categoryId
      ) {
        const newParentCategory = await this.prisma.industryCategory.findFirst({
          where: {
            id: updateSubcategoryDto.categoryId,
            deletedAt: null,
          },
        });

        if (!newParentCategory) {
          throw new NotFoundException(
            `行业分类不存在 ID: ${updateSubcategoryDto.categoryId}`,
          );
        }
      }

      // 如果更新名称，检查名称是否已被同一父分类下的其他子分类使用
      if (
        updateSubcategoryDto.name &&
        updateSubcategoryDto.name !== existingSubcategory.name
      ) {
        const categoryId =
          updateSubcategoryDto.categoryId || existingSubcategory.categoryId;
        const duplicateName = await this.prisma.industrySubCategory.findFirst({
          where: {
            categoryId,
            name: updateSubcategoryDto.name,
            id: { not: id },
            deletedAt: null,
          },
        });

        if (duplicateName) {
          throw new BadRequestException(
            `该分类下已存在名为 '${updateSubcategoryDto.name}' 的子分类`,
          );
        }
      }

      const subcategory = await this.prisma.industrySubCategory.update({
        where: { id },
        data: updateSubcategoryDto,
      });

      this.logger.log(`更新子分类成功 ID: ${id}`);

      return subcategory;
    } catch (error) {
      this.logger.error(`更新子分类失败: ${error.message}`, error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('更新子分类失败');
    }
  }

  /**
   * 删除行业子分类（软删除）
   */
  async deleteSubcategory(id: number): Promise<void> {
    try {
      // 检查子分类是否存在
      const existingSubcategory =
        await this.prisma.industrySubCategory.findFirst({
          where: {
            id,
            deletedAt: null,
          },
        });

      if (!existingSubcategory) {
        throw new NotFoundException(`子分类不存在 ID: ${id}`);
      }

      // 检查是否有职位使用此子分类
      const jobsUsingSubcategory = await this.prisma.jobPosting.count({
        where: {
          subCategoryId: id,
          deletedAt: null,
        },
      });

      if (jobsUsingSubcategory > 0) {
        throw new BadRequestException(
          `无法删除此子分类，有 ${jobsUsingSubcategory} 个职位正在使用它`,
        );
      }

      // 软删除子分类
      await this.prisma.industrySubCategory.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      this.logger.log(`删除子分类成功 ID: ${id}`);
    } catch (error) {
      this.logger.error(`删除子分类失败: ${error.message}`, error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('删除子分类失败');
    }
  }
}
