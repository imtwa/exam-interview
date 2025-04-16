import { IsOptional, IsInt, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryJobDto {
  @IsOptional()
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码最小为1' })
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量最小为1' })
  @Max(100, { message: '每页数量最大为100' })
  @Type(() => Number)
  pageSize?: number = 10;

  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  keyword?: string;

  @IsOptional()
  @IsInt({ message: '公司ID必须是整数' })
  @Type(() => Number)
  companyId?: number;

  @IsOptional()
  @IsInt({ message: '行业分类ID必须是整数' })
  @Type(() => Number)
  subCategoryId?: number;

  @IsOptional()
  @IsString({ message: '城市必须是字符串' })
  city?: string;

  @IsOptional()
  @IsInt({ message: '薪资下限必须是整数' })
  @Type(() => Number)
  salaryMin?: number;

  @IsOptional()
  @IsInt({ message: '薪资上限必须是整数' })
  @Type(() => Number)
  salaryMax?: number;
} 