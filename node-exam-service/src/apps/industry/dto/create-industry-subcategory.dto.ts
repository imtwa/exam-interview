import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateIndustrySubCategoryDto {
  @ApiProperty({ description: '二级分类名称', example: '前端开发' })
  @IsNotEmpty({ message: '分类名称不能为空' })
  @IsString({ message: '分类名称必须是字符串' })
  @MaxLength(50, { message: '分类名称不能超过50个字符' })
  name: string;

  @ApiProperty({
    description: '分类描述',
    required: false,
    example: '前端开发相关职位',
  })
  @IsOptional()
  @IsString({ message: '分类描述必须是字符串' })
  description?: string;

  @ApiProperty({ description: '所属一级分类ID', example: 1 })
  @IsNotEmpty({ message: '一级分类ID不能为空' })
  @Type(() => Number)
  @IsInt({ message: '一级分类ID必须是整数' })
  @Min(1, { message: '一级分类ID必须大于0' })
  categoryId: number;
}
