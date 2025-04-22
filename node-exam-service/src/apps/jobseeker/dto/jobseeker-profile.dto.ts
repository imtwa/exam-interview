import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Gender } from '../../../../prisma/generated/client';

export class JobSeekerProfileDto {
  @ApiProperty({
    description: '地址',
    example: '北京市朝阳区...',
    required: false,
  })
  @IsString({ message: '地址必须是字符串' })
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: '出生日期',
    example: '1990-01-01',
    required: false,
  })
  @IsDateString({}, { message: '出生日期格式不正确' })
  @IsOptional()
  birthday?: string;

  @ApiProperty({
    description: '性别',
    enum: Gender,
    example: Gender.MALE,
    required: false,
  })
  @IsEnum(Gender, { message: '性别不是有效的枚举值' })
  @IsOptional()
  gender?: Gender;

  @ApiProperty({
    description: '当前薪资',
    example: 15000,
    required: false,
  })
  @IsNumber({}, { message: '当前薪资必须是数字' })
  @IsOptional()
  currentSalary?: number;

  @ApiProperty({
    description: '期望薪资',
    example: 20000,
    required: false,
  })
  @IsNumber({}, { message: '期望薪资必须是数字' })
  @IsOptional()
  expectedSalary?: number;

  @ApiProperty({
    description: '期望职位',
    example: '前端开发工程师',
    required: false,
  })
  @IsString({ message: '期望职位必须是字符串' })
  @IsOptional()
  expectedPosition?: string;

  @ApiProperty({
    description: '期望工作城市',
    example: '北京',
    required: false,
  })
  @IsString({ message: '期望工作城市必须是字符串' })
  @IsOptional()
  expectedWorkCity?: string;
}
