import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Degree } from '../../../common/enums/degree.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({
    description: '职位标题',
    example: '资深前端开发工程师',
    required: true,
  })
  @IsNotEmpty({ message: '职位标题不能为空' })
  @IsString({ message: '职位标题必须是字符串' })
  title: string;

  @ApiProperty({
    description: '公司ID',
    example: 1,
    required: true,
  })
  @IsNotEmpty({ message: '公司ID不能为空' })
  @IsInt({ message: '公司ID必须是整数' })
  companyId: number;

  @ApiProperty({
    description: '面试官ID',
    example: 5,
    required: true,
  })
  @IsNotEmpty({ message: '面试官ID不能为空' })
  @IsInt({ message: '面试官ID必须是整数' })
  interviewerId: number;

  @ApiProperty({
    description: '行业分类ID',
    example: 3,
    required: true,
  })
  @IsNotEmpty({ message: '行业分类ID不能为空' })
  @IsInt({ message: '行业分类ID必须是整数' })
  subCategoryId: number;

  @ApiProperty({
    description: '职位描述',
    example:
      '负责公司核心产品的前端开发与维护，参与产品设计讨论，实现产品原型...',
    required: true,
  })
  @IsNotEmpty({ message: '职位描述不能为空' })
  @IsString({ message: '职位描述必须是字符串' })
  description: string;

  @ApiProperty({
    description: '职位要求',
    example: '熟练掌握HTML/CSS/JavaScript，有3年以上Vue.js开发经验...',
    required: true,
  })
  @IsNotEmpty({ message: '职位要求不能为空' })
  @IsString({ message: '职位要求必须是字符串' })
  requirements: string;

  @ApiProperty({
    description: '工作城市',
    example: '北京',
    required: true,
  })
  @IsNotEmpty({ message: '工作城市不能为空' })
  @IsString({ message: '工作城市必须是字符串' })
  city: string;

  @ApiProperty({
    description: '详细地址',
    example: '海淀区中关村科技园区1号楼',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '详细地址必须是字符串' })
  address?: string;

  @ApiProperty({
    description: '薪资下限（单位K）',
    example: 20,
    required: true,
    minimum: 0,
  })
  @IsNotEmpty({ message: '薪资下限不能为空' })
  @IsInt({ message: '薪资下限必须是整数' })
  @Min(0, { message: '薪资下限不能小于0' })
  salaryMin: number;

  @ApiProperty({
    description: '薪资上限（单位K）',
    example: 35,
    required: true,
    minimum: 0,
  })
  @IsNotEmpty({ message: '薪资上限不能为空' })
  @IsInt({ message: '薪资上限必须是整数' })
  @Min(0, { message: '薪资上限不能小于0' })
  salaryMax: number;

  @ApiProperty({
    description: '经验要求（年）',
    example: 3,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: '经验要求必须是整数' })
  @Min(0, { message: '经验要求不能小于0' })
  experienceReq?: number;

  @ApiProperty({
    description: '学历要求',
    example: 'BACHELOR',
    required: false,
    enum: Degree,
  })
  @IsOptional()
  @IsEnum(Degree, { message: '学历要求不是有效的枚举值' })
  educationReq?: Degree;

  @ApiProperty({
    description: '是否支持远程工作',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: '是否支持远程必须是布尔值' })
  isRemote?: boolean = false;
}
