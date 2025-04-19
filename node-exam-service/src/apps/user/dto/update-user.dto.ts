import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: '用户名',
    example: 'johndoe',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '用户名必须是字符串' })
  @Length(3, 20, { message: '用户名长度必须在3-20个字符之间' })
  username?: string;

  @ApiProperty({
    description: '邮箱',
    example: 'john@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiProperty({
    description: '密码，需包含字母和数字',
    example: 'Password123',
    required: false,
    minLength: 6,
    maxLength: 30,
  })
  @IsOptional()
  @IsString({ message: '密码必须是字符串' })
  @Length(6, 30, { message: '密码长度必须在6-30个字符之间' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])|(?=.*[a-z])(?=.*[0-9])|(?=.*[A-Z])(?=.*[0-9])/,
    {
      message: '密码必须包含字母和数字',
    },
  )
  password?: string;
}
