import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  Min,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePrivateExamDto {
  @ApiProperty({
    description: '专属试卷名称',
    example: '前端开发专属面试题集',
    required: true,
    maxLength: 100,
  })
  @IsNotEmpty({ message: '试卷名称不能为空' })
  @IsString({ message: '试卷名称必须是字符串' })
  @MaxLength(100, { message: '试卷名称不能超过100个字符' })
  name: string;

  @ApiProperty({
    description: '试卷简介',
    example: '面向前端开发岗位的专属面试题集',
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
    description: '要抽取的题目所在的收藏试卷ID列表',
    example: [1, 2, 3],
    required: true,
    type: [Number],
  })
  @IsNotEmpty({ message: '收藏试卷ID列表不能为空' })
  @IsArray({ message: '收藏试卷ID列表必须是数组' })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((id) => parseInt(id, 10))
      : [parseInt(value, 10)],
  )
  favoriteExamIds: number[];

  @ApiProperty({
    description: '每个试卷要抽取的题目数量',
    example: 5,
    required: false,
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: '抽题数量必须是整数' })
  @Min(1, { message: '抽题数量必须大于0' })
  @Transform(({ value }) => (value ? parseInt(value, 10) : 10))
  questionsPerExam?: number = 10;
}
