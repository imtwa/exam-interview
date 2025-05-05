import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyInvitationDto {
  @ApiProperty({
    description: '面试邀请码',
    example: 'abc123',
  })
  @IsNotEmpty({ message: '邀请码不能为空' })
  @IsString({ message: '邀请码必须是字符串' })
  @Length(6, 20, { message: '邀请码长度必须在6-20个字符之间' })
  invitationCode: string;
}
