import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyInvitationDto {
  @ApiProperty({
    description: '笔试邀请码',
    example: 'ABC123XYZ',
  })
  @IsNotEmpty({ message: '邀请码不能为空' })
  @IsString({ message: '邀请码必须是字符串' })
  invitationCode: string;
}
