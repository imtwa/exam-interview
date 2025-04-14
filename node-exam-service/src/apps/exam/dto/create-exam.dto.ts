import { IsNotEmpty, IsString, IsInt, IsOptional, IsBoolean, Min, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateExamDto {
  @IsNotEmpty({ message: '试卷名称不能为空' })
  @IsString({ message: '试卷名称必须是字符串' })
  @MaxLength(100, { message: '试卷名称不能超过100个字符' })
  name: string;

  @IsOptional()
  @IsString({ message: '试卷简介必须是字符串' })
  @MaxLength(500, { message: '试卷简介不能超过500个字符' })
  summary?: string;

  @IsOptional()
  @IsString({ message: '试卷详细描述必须是字符串' })
  description?: string;

  @IsNotEmpty({ message: '分类ID不能为空' })
  @IsInt({ message: '分类ID必须是整数' })
  @Min(1, { message: '分类ID必须大于0' })
  @Transform(({ value }) => parseInt(value, 10))
  categoryId: number;

  @IsOptional()
  @IsInt({ message: '二级分类ID必须是整数' })
  @Min(1, { message: '二级分类ID必须大于0' })
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  subCategoryId?: number;

  @IsOptional()
  @IsBoolean({ message: '是否公开必须是布尔值' })
  @Transform(({ value }) => value === 'true' || value === true)
  isPublic?: boolean = true;
} 