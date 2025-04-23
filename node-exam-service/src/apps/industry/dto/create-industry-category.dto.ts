import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIndustryCategoryDto {
  @ApiProperty({ description: '分类名称', example: '互联网/IT' })
  @IsNotEmpty({ message: '分类名称不能为空' })
  @IsString({ message: '分类名称必须是字符串' })
  @MaxLength(50, { message: '分类名称不能超过50个字符' })
  name: string;

  @ApiProperty({
    description: '分类描述',
    required: false,
    example: '互联网和信息技术相关行业',
  })
  @IsOptional()
  @IsString({ message: '分类描述必须是字符串' })
  description?: string;
}
