import { PartialType } from '@nestjs/mapped-types';
import { CreateInterviewDto } from './create-interview.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { InterviewStatus } from '../../../../prisma/generated/client';

export class UpdateInterviewDto extends PartialType(CreateInterviewDto) {
  @ApiProperty({
    description: '面试状态',
    enum: InterviewStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(InterviewStatus, { message: '面试状态不是有效的枚举值' })
  status?: InterviewStatus;

  @ApiProperty({
    description: '面试反馈',
    example: '候选人技术能力较强，沟通能力良好，建议进入下一轮面试',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '面试反馈必须是字符串' })
  feedback?: string;

  @ApiProperty({
    description: '面试评分 (1-5)',
    example: 4,
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '面试评分必须是数字' })
  @Min(1, { message: '面试评分最低为1' })
  @Max(5, { message: '面试评分最高为5' })
  feedbackRating?: number;
}
