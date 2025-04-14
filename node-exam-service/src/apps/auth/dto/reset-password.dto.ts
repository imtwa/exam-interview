import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
    @IsNotEmpty({ message: '邮箱不能为空' })
    @IsEmail({}, { message: '邮箱格式不正确' })
    email: string;

    @IsNotEmpty({ message: '验证码不能为空' })
    @IsString({ message: '验证码必须是字符串' })
    @Length(4, 6, { message: '验证码长度必须在4-6个字符之间' })
    code: string;
} 