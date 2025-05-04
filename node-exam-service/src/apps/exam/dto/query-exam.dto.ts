import { IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum ExamSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME = 'name',
  FAVORITE_COUNT = 'favoriteCount',
}

export class QueryExamDto {
  @ApiProperty({
    description: '页码',
    example: 1,
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须大于0' })
  @Transform(({ value }) => {
    if (value === undefined) return 1;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 1 : parsed;
  })
  page?: number = 1;

  @ApiProperty({
    description: '每页数量',
    example: 10,
    required: false,
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量必须大于0' })
  @Transform(({ value }) => {
    if (value === undefined) return 10;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 10 : parsed;
  })
  pageSize?: number = 10;

  @ApiProperty({
    description: '分类ID',
    example: 1,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: '分类ID必须是整数' })
  @Min(1, { message: '分类ID必须大于0' })
  @Transform(({ value }) => {
    if (value === undefined || value === '') return undefined;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  })
  categoryId?: number;

  @ApiProperty({
    description: '二级分类ID',
    example: 5,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: '二级分类ID必须是整数' })
  @Min(1, { message: '二级分类ID必须大于0' })
  @Transform(({ value }) => {
    if (value === undefined || value === '') return undefined;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  })
  subCategoryId?: number;

  @ApiProperty({
    description: '搜索关键词',
    example: 'Java',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  keyword?: string;

  @ApiProperty({
    description: '排序字段',
    example: ExamSortField.CREATED_AT,
    required: false,
    default: ExamSortField.CREATED_AT,
    enum: ExamSortField,
  })
  @IsOptional()
  @IsEnum(ExamSortField, { message: '排序字段无效' })
  sortField?: ExamSortField = ExamSortField.CREATED_AT;

  @ApiProperty({
    description: '排序方式',
    example: 'desc',
    required: false,
    default: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: '排序方式必须是asc或desc' })
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiProperty({
    description: '面试官ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: '面试官ID必须是整数' })
  @Min(1, { message: '面试官ID必须大于0' })
  @Transform(({ value }) => {
    if (value === undefined || value === '') return undefined;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  })
  interviewerId?: number;
}
