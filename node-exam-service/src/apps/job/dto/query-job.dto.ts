import {
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Degree } from '../../../common/enums/degree.enum';

export class QueryJobDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码不能小于1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量不能小于1' })
  @Max(100, { message: '每页数量不能大于100' })
  pageSize?: number = 10;

  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  keyword?: string;

  @IsOptional()
  @IsString({ message: '城市必须是字符串' })
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '公司ID必须是整数' })
  companyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '行业分类ID必须是整数' })
  subCategoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '薪资下限必须是整数' })
  @Min(0, { message: '薪资下限不能小于0' })
  salaryMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '薪资上限必须是整数' })
  @Min(0, { message: '薪资上限不能小于0' })
  salaryMax?: number;

  @IsOptional()
  @IsString({ message: '远程选项必须是字符串' })
  isRemote?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '经验要求必须是整数' })
  @Min(0, { message: '经验要求不能小于0' })
  experienceReq?: number;

  @IsOptional()
  @IsEnum(Degree, { message: '学历要求不是有效的枚举值' })
  educationReq?: Degree;

  @IsOptional()
  @IsString({ message: '排序字段必须是字符串' })
  sortField?: string = 'createdAt';

  @IsOptional()
  @IsString({ message: '排序方向必须是字符串' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}
