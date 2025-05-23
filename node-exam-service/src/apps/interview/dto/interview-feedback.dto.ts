import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class InterviewFeedbackDto {
  @ApiProperty({
    description: '面试邀请码',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsString({ message: '面试邀请码必须是字符串' })
  @IsNotEmpty({ message: '面试邀请码不能为空' })
  invitationCode: string;

  @ApiProperty({
    description: '面试反馈内容',
    example: '候选人技术能力较强，沟通能力良好，建议进入下一轮面试',
    required: true,
  })
  @IsString({ message: '面试反馈必须是字符串' })
  @IsNotEmpty({ message: '面试反馈不能为空' })
  comments: string;

  @ApiProperty({
    description: '面试评分 (1-5)',
    example: 4,
    minimum: 1,
    maximum: 5,
    required: true,
  })
  @IsNumber({}, { message: '面试评分必须是数字' })
  @Min(1, { message: '面试评分最低为1' })
  @Max(5, { message: '面试评分最高为5' })
  feedbackRating: number;
}
 