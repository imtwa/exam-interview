import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../../../prisma/generated/client';

export class QueryJobSeekerDto {
  @ApiProperty({
    description: '当前页码',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须大于等于1' })
  page?: number = 1;

  @ApiProperty({
    description: '每页条数',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: '每页条数必须是整数' })
  @Min(1, { message: '每页条数必须大于等于1' })
  pageSize?: number = 10;

  @ApiProperty({
    description: '用户名',
    example: 'johndoe',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '用户名必须是字符串' })
  username?: string;

  @ApiProperty({
    description: '期望职位',
    example: '前端开发工程师',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '期望职位必须是字符串' })
  expectedPosition?: string;

  @ApiProperty({
    description: '期望工作城市',
    example: '北京',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '期望工作城市必须是字符串' })
  expectedWorkCity?: string;

  @ApiProperty({
    description: '性别',
    enum: Gender,
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender, { message: '性别不是有效的枚举值' })
  gender?: Gender;
}
