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
import { success, pagination } from '../../common/utils/response.util';

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
  async register(@Body() createUserDto: CreateUserDto) {
    const result = await this.userService.register(createUserDto);
    return success(result, '注册成功');
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const result = await this.userService.login(loginUserDto);
    return success(result, '登录成功');
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.userService.resetPassword(resetPasswordDto);
    return success(result, '密码重置成功');
  }

  @Get('page')
  async findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 10) {
    const { users, total } = await this.userService.findAll(page, pageSize);
    return pagination(users, total, page, pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.userService.findOne(+id);
    return success(result);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const result = await this.userService.update(+id, updateUserDto);
    return success(result, '更新成功');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.userService.remove(+id);
    return success(null, '删除成功');
  }
}
