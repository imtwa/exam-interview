import { IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ExamSortField {
  CREATED_AT = 'createdAt',
  FAVORITE_COUNT = 'favoriteCount',
  NAME = 'name',
}

export class QueryExamDto {
  @IsOptional()
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须大于0' })
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsOptional()
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量必须大于0' })
  @Transform(({ value }) => parseInt(value, 10))
  pageSize?: number = 10;

  @IsOptional()
  @IsInt({ message: '分类ID必须是整数' })
  @Min(1, { message: '分类ID必须大于0' })
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  categoryId?: number;

  @IsOptional()
  @IsInt({ message: '二级分类ID必须是整数' })
  @Min(1, { message: '二级分类ID必须大于0' })
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  subCategoryId?: number;

  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  keyword?: string;

  @IsOptional()
  @IsEnum(ExamSortField, { message: '排序字段无效' })
  sortField?: ExamSortField = ExamSortField.CREATED_AT;

  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: '排序方式必须是asc或desc' })
  sortOrder?: 'asc' | 'desc' = 'desc';
} 