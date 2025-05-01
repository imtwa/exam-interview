import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiProperty({
    description: '分类名称',
    example: '前端开发',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '分类名称必须是字符串' })
  @MaxLength(50, { message: '分类名称不能超过50个字符' })
  name?: string;

  @ApiProperty({
    description: '分类描述',
    required: false,
    example: '前端开发相关试题',
  })
  @IsOptional()
  @IsString({ message: '分类描述必须是字符串' })
  description?: string;
}
