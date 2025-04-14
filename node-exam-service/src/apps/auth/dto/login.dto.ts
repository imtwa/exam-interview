import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsNotEmpty({ message: '用户名不能为空' })
    @IsEmail({}, { message: '邮箱格式不正确' })
    email: string;

    @IsNotEmpty({ message: '密码不能为空' })
    @MinLength(6, { message: '密码长度不能少于6位' })
    password: string;

    @IsNotEmpty({ message: '验证码不能为空' })
    @IsString()
    captcha: string;

    @IsNotEmpty({ message: '验证码标识不能为空' })
    @IsString()
    captchaId: string;
} 