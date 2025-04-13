import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PrismaClient } from '../../../generated/prisma/client';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @Inject('PRISMA_CLIENT')
    private prisma: PrismaClient,
    private redisService: RedisService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { username, email, password, code } = createUserDto;

    // 验证验证码
    const cacheCode = await this.redisService.get(`captcha_${email}`);
    if (!cacheCode) {
      throw new BadRequestException('验证码已过期');
    }

    if (code !== cacheCode) {
      throw new BadRequestException('验证码不正确');
    }

    // 检查用户名和邮箱是否已存在
    const existingUser = await this.prisma.exam_front_user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existingUser) {
      throw new BadRequestException('用户名或邮箱已被注册');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await this.prisma.exam_front_user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // 删除验证码
    await this.redisService.set(`captcha_${email}`, '', 1);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password, captchaId, captchaText } = loginUserDto;

    // 验证图片验证码
    const cacheCaptcha = await this.redisService.get(`img_captcha_${captchaId}`);
    if (!cacheCaptcha) {
      throw new BadRequestException('图片验证码已过期');
    }

    if (captchaText.toLowerCase() !== cacheCaptcha) {
      throw new BadRequestException('图片验证码不正确');
    }

    // 查找用户
    const user = await this.prisma.exam_front_user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('邮箱或密码不正确');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码不正确');
    }

    // 使用后删除验证码
    await this.redisService.set(`img_captcha_${captchaId}`, '', 1);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, code } = resetPasswordDto;
    // 验证验证码
    const cacheCode = await this.redisService.get(`captcha_${email}`);

    if (!cacheCode) {
      throw new BadRequestException('验证码已过期');
    }

    if (code !== cacheCode) {
      throw new BadRequestException('验证码不正确');
    }

    // 查找用户
    const user = await this.prisma.exam_front_user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 重置密码为 user123456
    const defaultPassword = 'user123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 更新用户密码
    await this.prisma.exam_front_user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // 删除验证码
    await this.redisService.set(`captcha_${email}`, '', 1);

    return {
      message: '密码重置成功',
      email,
      defaultPassword,
    };
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
