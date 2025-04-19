import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExamDto {
  @ApiProperty({
    description: '试卷名称',
    example: '2023年春季Java开发工程师笔试题',
    required: true,
    maxLength: 100,
  })
  @IsNotEmpty({ message: '试卷名称不能为空' })
  @IsString({ message: '试卷名称必须是字符串' })
  @MaxLength(100, { message: '试卷名称不能超过100个字符' })
  name: string;

  @ApiProperty({
    description: '试卷简介',
    example: '本试卷包含Java基础、Spring框架、数据库等相关知识点',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '试卷简介必须是字符串' })
  @MaxLength(500, { message: '试卷简介不能超过500个字符' })
  description?: string;

  @ApiProperty({
    description: '分类ID',
    example: 1,
    required: true,
    minimum: 1,
  })
  @IsNotEmpty({ message: '分类ID不能为空' })
  @IsInt({ message: '分类ID必须是整数' })
  @Min(1, { message: '分类ID必须大于0' })
  @Transform(({ value }) => parseInt(value, 10))
  categoryId: number;

  @ApiProperty({
    description: '二级分类ID',
    example: 5,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: '二级分类ID必须是整数' })
  @Min(1, { message: '二级分类ID必须大于0' })
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  subCategoryId?: number;

  @ApiProperty({
    description: '是否公开',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: '是否公开必须是布尔值' })
  @Transform(({ value }) => value === 'true' || value === true)
  isPublic?: boolean = true;
}
