import { IsOptional, IsEnum, IsInt, Min, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InterviewStatus } from '../../../../prisma/generated/client';
import { Type } from 'class-transformer';

export class QueryInterviewDto {
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
    description: '职位申请ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: '职位申请ID必须是整数' })
  applicationId?: number;

  @ApiProperty({
    description: '面试状态',
    enum: InterviewStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(InterviewStatus, { message: '面试状态不是有效的枚举值' })
  status?: InterviewStatus;

  @ApiProperty({
    description: '开始日期',
    example: '2023-06-01',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: '开始日期格式不正确' })
  startDate?: Date;

  @ApiProperty({
    description: '结束日期',
    example: '2023-06-30',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: '结束日期格式不正确' })
  endDate?: Date;
}
