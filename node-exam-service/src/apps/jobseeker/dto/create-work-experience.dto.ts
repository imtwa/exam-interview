import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateWorkExperienceDto {
  @ApiProperty({ description: '公司名称', example: '字节跳动' })
  @IsString({ message: '公司名称必须是字符串' })
  company: string;

  @ApiProperty({ description: '职位名称', example: '前端开发工程师' })
  @IsString({ message: '职位名称必须是字符串' })
  position: string;

  @ApiProperty({
    description: '开始日期',
    example: '2020-07-01',
  })
  @IsDateString({}, { message: '开始日期格式不正确' })
  startDate: string;

  @ApiProperty({
    description: '结束日期',
    example: '2023-06-30',
    required: false,
  })
  @IsDateString({}, { message: '结束日期格式不正确' })
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: '工作描述',
    example: '负责公司核心产品的前端开发...',
    required: false,
  })
  @IsString({ message: '工作描述必须是字符串' })
  @IsOptional()
  description?: string;
}
