import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, Inject } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Response } from 'express';
import { RedisService } from '../redis/redis.service';
import * as svgCaptcha from 'svg-captcha';
import { v4 as uuidv4 } from 'uuid';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Inject()
  private redisService: RedisService;

  @Get('captcha')
  async getCaptcha(@Res() res: Response) {
    const captcha = svgCaptcha.create({
      size: 4, // 验证码长度
      ignoreChars: '0o1il', // 排除容易混淆的字符
      noise: 2, // 干扰线条数量
      color: true, // 开启彩色
      background: '#f0f0f0', // 背景色
    });

    // 生成唯一标识
    const captchaId = uuidv4();
    
    // 存储验证码文本到 Redis，有效期 5 分钟
    await this.redisService.set(`img_captcha_${captchaId}`, captcha.text.toLowerCase(), 5 * 60);

    // 设置响应头
    res.type('svg');
    
    // 返回验证码信息
    return res.status(200).send({
      id: captchaId,
      img: captcha.data
    });
  }

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.userService.resetPassword(resetPasswordDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
