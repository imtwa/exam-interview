import { ApiProperty } from '@nestjs/swagger';

export class UserDecodeDto {
  @ApiProperty({
    description: '用户ID',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: '用户名',
    example: 'testuser',
  })
  username: string;

  @ApiProperty({
    description: '角色',
    example: 'USER',
  })
  role: string;
}
