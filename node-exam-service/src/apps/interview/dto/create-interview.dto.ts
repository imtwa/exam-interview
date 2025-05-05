import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  Min,
  IsDate,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateInterviewDto {
  @ApiProperty({
    description: '职位申请ID',
    example: 1,
    required: true,
  })
  @IsNotEmpty({ message: '职位申请ID不能为空' })
  @IsInt({ message: '职位申请ID必须是整数' })
  @Transform(({ value }) => parseInt(value))
  applicationId: number;

  @ApiProperty({
    description: '面试时间',
    example: '2023-06-01T10:00:00Z',
    required: true,
  })
  @IsNotEmpty({ message: '面试时间不能为空' })
  @IsDateString()
  scheduleTime: Date;

  @ApiProperty({
    description: '面试时长(分钟)',
    example: 60,
    required: true,
  })
  @IsNotEmpty({ message: '面试时长不能为空' })
  @IsInt({ message: '面试时长必须是整数' })
  @Min(15, { message: '面试时长不能少于15分钟' })
  @Transform(({ value }) => parseInt(value))
  duration: number;

  @ApiProperty({
    description: '面试地点',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: '面试备注',
    example: '请提前准备自我介绍和项目经验分享',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '面试备注必须是字符串' })
  notes?: string;
}
