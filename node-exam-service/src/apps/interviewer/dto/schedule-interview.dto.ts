import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum InterviewRound {
  FIRST_INTERVIEW = 'FIRST_INTERVIEW',
  SECOND_INTERVIEW = 'SECOND_INTERVIEW',
  HR_INTERVIEW = 'HR_INTERVIEW',
}

export enum InterviewType {
  PHONE = 'phone',
  VIDEO = 'video',
  ONSITE = 'onsite',
}

export class ScheduleInterviewDto {
  @ApiProperty({
    description: '面试轮次',
    enum: InterviewRound,
    default: InterviewRound.FIRST_INTERVIEW,
  })
  @IsEnum(InterviewRound)
  round: InterviewRound;

  @ApiProperty({ description: '面试时间 (ISO8601格式)' })
  @IsDateString()
  scheduleTime: string;

  @ApiProperty({ description: '面试时长 (分钟)' })
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  duration: number;

  @ApiProperty({
    description: '面试类型',
    enum: InterviewType,
    default: InterviewType.VIDEO,
  })
  @IsEnum(InterviewType)
  type: InterviewType;

  @ApiProperty({ description: '面试地点 (仅现场面试)', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: '面试官ID列表', type: [Number] })
  @IsArray()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((id) => (typeof id === 'string' ? parseInt(id) : id));
    }
    return value;
  })
  interviewerIds?: number[];

  @ApiProperty({ description: '面试备注', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: '是否发送邮件通知', default: true })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  sendEmail: boolean;
}
