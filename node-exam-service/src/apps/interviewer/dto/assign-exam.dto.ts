import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class AssignExamDto {
  @ApiProperty({
    description: '应聘申请ID',
    example: 1,
  })
  @IsNotEmpty({ message: '应聘申请ID不能为空' })
  @IsNumber({}, { message: '应聘申请ID必须是数字' })
  @Transform(({ value }) => parseInt(value, 10))
  applicationId: number;

  @ApiProperty({
    description: '求职者ID',
    example: 1,
  })
  @IsNotEmpty({ message: '求职者ID不能为空' })
  @IsNumber({}, { message: '求职者ID必须是数字' })
  @Transform(({ value }) => parseInt(value, 10))
  jobSeekerId: number;

  @ApiProperty({
    description: '试卷ID',
    example: 1,
  })
  @IsNotEmpty({ message: '试卷ID不能为空' })
  @IsNumber({}, { message: '试卷ID必须是数字' })
  @Transform(({ value }) => parseInt(value, 10))
  examId: number;

  @ApiProperty({
    description: '笔试说明',
    example: '请认真完成试卷，不允许查阅资料',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '笔试说明必须是字符串' })
  note?: string;

  @ApiProperty({
    description: '考试开始时间',
    example: '2023-06-01T08:00:00Z',
  })
  @IsNotEmpty({ message: '考试开始时间不能为空' })
  @IsDateString({}, { message: '考试开始时间格式不正确' })
  examStartTime: string;

  @ApiProperty({
    description: '考试截止时间',
    example: '2023-06-05T20:00:00Z',
  })
  @IsNotEmpty({ message: '考试截止时间不能为空' })
  @IsDateString({}, { message: '考试截止时间格式不正确' })
  examEndTime: string;

  @ApiProperty({
    description: '考试时长(分钟)',
    example: 120,
  })
  @IsNotEmpty({ message: '考试时长不能为空' })
  @IsNumber({}, { message: '考试时长必须是数字' })
  @Min(1, { message: '考试时长不能小于1分钟' })
  @Transform(({ value }) => parseInt(value, 10))
  duration: number;
}
