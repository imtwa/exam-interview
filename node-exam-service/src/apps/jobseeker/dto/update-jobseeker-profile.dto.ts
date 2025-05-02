import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDate,
  IsNumber,
  IsArray,
  ValidateNested,
  IsObject,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Degree, Gender } from '../../../../prisma/generated/client';

// 基本信息DTO
export class BasicInfoDto {
  @ApiProperty({
    description: '性别',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({
    description: '出生日期',
    example: '1990-01-01',
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  birthday?: Date;

  @ApiProperty({
    description: '地址',
    example: '北京市 朝阳区',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: '详细地址',
    example: '某街道某号',
  })
  @IsString()
  @IsOptional()
  detailAddress?: string;

  @ApiProperty({
    description: '地区代码',
    example: ['110000', '110105'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  regionCodes?: string[];

  @ApiProperty({
    description: '地区名称',
    example: ['北京市', '朝阳区'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  regionNames?: string[];
}

// 教育经历DTO
export class EducationDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '学校名称',
    required: false,
    example: '北京大学',
  })
  school: string;

  @IsOptional()
  @IsEnum(Degree)
  @ApiProperty({
    description: '学历',
    required: false,
    enum: Degree,
    example: Degree.BACHELOR,
  })
  degree: Degree;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '专业',
    required: false,
    example: '计算机科学',
  })
  major: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    description: '开始日期',
    required: false,
    example: '2016-09-01',
  })
  startDate: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    description: '结束日期',
    required: false,
    example: '2020-06-30',
  })
  endDate: string;
}

// 工作经验DTO
export class ExperienceDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '公司名称',
    required: false,
    example: '字节跳动',
  })
  company: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '职位名称',
    required: false,
    example: '前端工程师',
  })
  position: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    description: '开始日期',
    required: false,
    example: '2020-01-01',
  })
  startDate: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    description: '结束日期',
    required: false,
    example: '2022-01-01',
  })
  endDate: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '工作描述',
    required: false,
    example: '负责公司前端项目的开发和维护',
  })
  description: string;
}

// 求职意向DTO
export class JobIntentionDto {
  @ApiProperty({
    description: '期望职位',
    example: '前端开发工程师',
  })
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiProperty({
    description: '期望城市代码',
    example: ['110000', '110105'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  cityCode?: string[];

  @ApiProperty({
    description: '期望城市名称',
    example: '北京',
  })
  @IsString()
  @IsOptional()
  cityName?: string;

  @ApiProperty({
    description: '当前薪资',
    example: 10000,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  currentSalary?: number;

  @ApiProperty({
    description: '期望最低薪资',
    example: 15000,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryMin?: number;

  @ApiProperty({
    description: '期望最高薪资',
    example: 20000,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryMax?: number;
}

// 完整求职者资料更新DTO
export class UpdateJobseekerProfileDto {
  @ApiProperty({
    description: '基本信息',
    type: BasicInfoDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => BasicInfoDto)
  @IsOptional()
  basic?: BasicInfoDto;

  @ApiProperty({
    description: '教育经历',
    type: EducationDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => EducationDto)
  @IsOptional()
  education?: EducationDto;

  @ApiProperty({
    description: '工作经历',
    type: ExperienceDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ExperienceDto)
  @IsOptional()
  experience?: ExperienceDto;

  @ApiProperty({
    description: '求职意向',
    type: JobIntentionDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => JobIntentionDto)
  @IsOptional()
  jobIntention?: JobIntentionDto;
}
