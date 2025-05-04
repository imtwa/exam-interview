import { IsNotEmpty, IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitExamDto {
  @ApiProperty({
    description: '笔试邀请码',
    example: 'ABC123XYZ',
  })
  @IsNotEmpty({ message: '邀请码不能为空' })
  @IsString({ message: '邀请码必须是字符串' })
  invitationCode: string;

  @ApiProperty({
    description: '考生答案，JSON格式',
    example: { '1': 'A', '2': ['B', 'C'], '3': true, '4': '北京' },
  })
  @IsNotEmpty({ message: '答案不能为空' })
  @IsObject({ message: '答案必须是JSON对象' })
  answers: Record<string, any>;
}
