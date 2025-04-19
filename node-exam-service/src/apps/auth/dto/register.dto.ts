import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../../../../prisma/generated';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: '用户名',
    example: 'johndoe',
    required: true,
    minLength: 3,
    maxLength: 20,
  })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  @Length(3, 20, { message: '用户名长度必须在3-20个字符之间' })
  username: string;

  @ApiProperty({
    description: '邮箱',
    example: 'john@example.com',
    required: true,
  })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({
    description: '密码，需包含字母和数字',
    example: 'Password123',
    required: true,
    minLength: 6,
    maxLength: 30,
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @Length(6, 30, { message: '密码长度必须在6-30个字符之间' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])|(?=.*[a-z])(?=.*[0-9])|(?=.*[A-Z])(?=.*[0-9])/,
    {
      message: '密码必须包含字母和数字',
    },
  )
  password: string;

  @ApiProperty({
    description: '邮箱验证码',
    example: '123456',
    required: true,
    minLength: 4,
    maxLength: 6,
  })
  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString({ message: '验证码必须是字符串' })
  @Length(4, 6, { message: '验证码长度必须在4-6个字符之间' })
  code: string;

  @ApiProperty({
    description: '用户角色',
    example: 'CANDIDATE',
    required: true,
    enum: UserRole,
  })
  @IsNotEmpty({ message: '用户角色不能为空' })
  @IsEnum(UserRole, { message: '用户角色只能是求职者或面试官' })
  role: UserRole;
}
