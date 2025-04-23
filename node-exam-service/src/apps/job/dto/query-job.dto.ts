import { IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

enum JobSortField {
  CREATED_AT = 'createdAt',
  SALARY = 'salary',
}

export class QueryJobDto {
  @ApiProperty({ description: '当前页码', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须大于0' })
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量必须大于0' })
  pageSize?: number = 10;

  @ApiProperty({
    description: '关键词搜索',
    required: false,
    example: '前端开发',
  })
  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  keyword?: string;

  @ApiProperty({ description: '公司ID', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '公司ID必须是整数' })
  @Min(1, { message: '公司ID必须大于0' })
  companyId?: number;

  @ApiProperty({ description: '城市', required: false, example: '北京' })
  @IsOptional()
  @IsString({ message: '城市必须是字符串' })
  city?: string;

  @ApiProperty({ description: '薪资下限', required: false, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '薪资下限必须是整数' })
  @Min(0, { message: '薪资下限不能小于0' })
  salaryMin?: number;

  @ApiProperty({ description: '薪资上限', required: false, example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '薪资上限必须是整数' })
  @Min(0, { message: '薪资上限不能小于0' })
  salaryMax?: number;

  @ApiProperty({ description: '一级分类ID', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '一级分类ID必须是整数' })
  @Min(1, { message: '一级分类ID必须大于0' })
  categoryId?: number;

  @ApiProperty({ description: '二级分类ID', required: false, example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '二级分类ID必须是整数' })
  @Min(1, { message: '二级分类ID必须大于0' })
  subCategoryId?: number;

  @ApiProperty({
    description: '排序字段',
    required: false,
    enum: JobSortField,
    default: JobSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(JobSortField, { message: '排序字段不合法' })
  sortField?: JobSortField = JobSortField.CREATED_AT;

  @ApiProperty({
    description: '排序方式',
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: '排序方式只能是asc或desc' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export { JobSortField };
