import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyInvitationCodeDto {
  @ApiProperty({
    description: '面试邀请码',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsNotEmpty({ message: '邀请码不能为空' })
  @IsString({ message: '邀请码必须是字符串' })
  invitationCode: string;
}
