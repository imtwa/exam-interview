import { IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString({ message: '用户名必须是字符串' })
    @Length(3, 20, { message: '用户名长度必须在3-20个字符之间' })
    username?: string;

    @IsOptional()
    @IsEmail({}, { message: '邮箱格式不正确' })
    email?: string;

    @IsOptional()
    @IsString({ message: '密码必须是字符串' })
    @Length(6, 30, { message: '密码长度必须在6-30个字符之间' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])|(?=.*[a-z])(?=.*[0-9])|(?=.*[A-Z])(?=.*[0-9])/, {
        message: '密码必须包含字母和数字',
    })
    password?: string;
}
