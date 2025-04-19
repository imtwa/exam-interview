import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: '用户邮箱',
    example: 'user@example.com',
    required: true,
  })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({
    description: '登录密码',
    example: 'Password123',
    required: true,
    minLength: 6,
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  password: string;

  @ApiProperty({
    description: '图形验证码内容',
    example: 'A1B2',
    required: true,
  })
  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString()
  captcha: string;

  @ApiProperty({
    description: '图形验证码标识',
    example: '12345678-1234-5678-1234-567812345678',
    required: true,
  })
  @IsNotEmpty({ message: '验证码标识不能为空' })
  @IsString()
  captchaId: string;
}
