import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Degree } from '../../../../prisma/generated/client';

export class CreateJobPostingDto {
  @ApiProperty({ description: '职位标题', example: '前端开发工程师' })
  @IsNotEmpty({ message: '职位标题不能为空' })
  @IsString({ message: '职位标题必须是字符串' })
  @MaxLength(100, { message: '职位标题不能超过100个字符' })
  title: string;

  @ApiProperty({ description: '所属公司ID', example: 1 })
  @IsNotEmpty({ message: '公司ID不能为空' })
  @Type(() => Number)
  @IsInt({ message: '公司ID必须是整数' })
  @Min(1, { message: '公司ID必须大于0' })
  companyId: number;

  @ApiProperty({ description: '所属行业二级分类ID', example: 2 })
  @IsNotEmpty({ message: '行业分类ID不能为空' })
  @Type(() => Number)
  @IsInt({ message: '行业分类ID必须是整数' })
  @Min(1, { message: '行业分类ID必须大于0' })
  subCategoryId: number;

  @ApiProperty({
    description: '职位描述',
    example: '负责公司前端项目的开发和维护...',
  })
  @IsNotEmpty({ message: '职位描述不能为空' })
  @IsString({ message: '职位描述必须是字符串' })
  description: string;

  @ApiProperty({
    description: '职位要求',
    example: '1. 熟悉React、Vue等前端框架...',
  })
  @IsNotEmpty({ message: '职位要求不能为空' })
  @IsString({ message: '职位要求必须是字符串' })
  requirements: string;

  @ApiProperty({ description: '工作城市', example: '北京' })
  @IsNotEmpty({ message: '工作城市不能为空' })
  @IsString({ message: '工作城市必须是字符串' })
  @MaxLength(50, { message: '工作城市不能超过50个字符' })
  city: string;

  @ApiProperty({
    description: '详细地址',
    required: false,
    example: '朝阳区望京SOHO T1座',
  })
  @IsOptional()
  @IsString({ message: '详细地址必须是字符串' })
  @MaxLength(200, { message: '详细地址不能超过200个字符' })
  address?: string;

  @ApiProperty({ description: '薪资下限(单位:千元)', example: 15 })
  @IsNotEmpty({ message: '薪资下限不能为空' })
  @Type(() => Number)
  @IsInt({ message: '薪资下限必须是整数' })
  @Min(0, { message: '薪资下限不能小于0' })
  salaryMin: number;

  @ApiProperty({ description: '薪资上限(单位:千元)', example: 25 })
  @IsNotEmpty({ message: '薪资上限不能为空' })
  @Type(() => Number)
  @IsInt({ message: '薪资上限必须是整数' })
  @Min(0, { message: '薪资上限不能小于0' })
  salaryMax: number;

  @ApiProperty({ description: '经验要求(年)', required: false, example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '经验要求必须是整数' })
  @Min(0, { message: '经验要求不能小于0' })
  experienceReq?: number;

  @ApiProperty({
    description: '学历要求',
    required: false,
    enum: Degree,
    example: Degree.BACHELOR,
  })
  @IsOptional()
  @IsEnum(Degree, { message: '学历要求值不合法' })
  educationReq?: Degree;

  @ApiProperty({ description: '是否支持远程', required: false, default: false })
  @IsOptional()
  @IsBoolean({ message: '远程标志必须是布尔值' })
  isRemote?: boolean = false;
}
