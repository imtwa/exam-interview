import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PrismaClient } from '../../../generated/prisma/client';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcryptjs';
import { LoggerService } from '../../common/logger/logger.service';

@Injectable()
export class UserService {
  private readonly logger: LoggerService;

  constructor(
    @Inject('PRISMA_CLIENT')
    private prisma: PrismaClient,
    private redisService: RedisService,
    private loggerService: LoggerService
  ) {
    this.logger = loggerService;
    this.logger.setContext('UserService');
  }

  async register(createUserDto: CreateUserDto) {
    const { username, email, password, code } = createUserDto;
    this.logger.log(`用户注册请求: ${email}`);

    // 验证验证码
    const cacheCode = await this.redisService.get(`captcha_${email}`);
    if (!cacheCode) {
      this.logger.warn(`验证码已过期: ${email}`);
      throw new BadRequestException('验证码已过期');
    }

    if (code !== cacheCode) {
      this.logger.warn(`验证码不正确: ${email}, 预期: ${cacheCode}, 实际: ${code}`);
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
      this.logger.warn(`用户名或邮箱已被注册: ${existingUser.email}`);
      throw new BadRequestException('用户名或邮箱已被注册');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    this.logger.debug(`密码已加密: ${email}`);

    // 创建用户
    const user = await this.prisma.exam_front_user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    this.logger.log(`用户注册成功: ${email}, ID: ${user.id}`);

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
    this.logger.log(`用户登录请求: ${email}`);

    // 验证图片验证码
    const cacheCaptcha = await this.redisService.get(`img_captcha_${captchaId}`);
    if (!cacheCaptcha) {
      this.logger.warn(`图片验证码已过期: ${email}, captchaId: ${captchaId}`);
      throw new BadRequestException('图片验证码已过期');
    }

    if (captchaText.toLowerCase() !== cacheCaptcha) {
      this.logger.warn(`图片验证码不正确: ${email}, 预期: ${cacheCaptcha}, 实际: ${captchaText.toLowerCase()}`);
      throw new BadRequestException('图片验证码不正确');
    }

    // 查找用户
    const user = await this.prisma.exam_front_user.findUnique({
      where: { email },
    });

    if (!user) {
      this.logger.warn(`登录失败，用户不存在: ${email}`);
      throw new UnauthorizedException('邮箱或密码不正确');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`登录失败，密码错误: ${email}`);
      throw new UnauthorizedException('邮箱或密码不正确');
    }

    this.logger.log(`用户登录成功: ${email}, ID: ${user.id}`);

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
    this.logger.log(`密码重置请求: ${email}`);

    // 验证验证码
    const cacheCode = await this.redisService.get(`captcha_${email}`);

    if (!cacheCode) {
      this.logger.warn(`验证码已过期: ${email}`);
      throw new BadRequestException('验证码已过期');
    }

    if (code !== cacheCode) {
      this.logger.warn(`验证码不正确: ${email}, 预期: ${cacheCode}, 实际: ${code}`);
      throw new BadRequestException('验证码不正确');
    }

    // 查找用户
    const user = await this.prisma.exam_front_user.findUnique({
      where: { email },
    });

    if (!user) {
      this.logger.warn(`密码重置失败，用户不存在: ${email}`);
      throw new BadRequestException('用户不存在');
    }

    // 重置密码为 user123456
    const defaultPassword = 'user123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    this.logger.debug(`密码已重置为默认密码: ${email}`);

    // 更新用户密码
    await this.prisma.exam_front_user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    this.logger.log(`密码重置成功: ${email}`);

    // 删除验证码
    await this.redisService.set(`captcha_${email}`, '', 1);

    return {
      message: '密码重置成功',
      email,
      defaultPassword,
    };
  }

  async findAll(page: number, pageSize: number) {
    this.logger.log(`获取用户列表，页码: ${page}, 每页数量: ${pageSize}`);
    const skip = (page - 1) * pageSize;
    
    // 查询用户列表
    const users = await this.prisma.exam_front_user.findMany({
      skip,
      take: pageSize,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        // 不返回密码字段
      },
    });
    
    // 获取总数
    const total = await this.prisma.exam_front_user.count();
    this.logger.debug(`获取到 ${users.length} 条用户记录，总数: ${total}`);
    
    return { users, total };
  }

  async findOne(id: number) {
    this.logger.log(`查询用户详情，ID: ${id}`);
    const user = await this.prisma.exam_front_user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      this.logger.warn(`用户不存在，ID: ${id}`);
      throw new BadRequestException('用户不存在');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    this.logger.log(`更新用户，ID: ${id}`);
    
    // 检查用户是否存在
    const existingUser = await this.prisma.exam_front_user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      this.logger.warn(`更新失败，用户不存在，ID: ${id}`);
      throw new BadRequestException('用户不存在');
    }

    // 更新用户信息
    const updatedUser = await this.prisma.exam_front_user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    this.logger.log(`用户更新成功，ID: ${id}`);
    return updatedUser;
  }

  async remove(id: number) {
    this.logger.log(`删除用户，ID: ${id}`);
    
    // 检查用户是否存在
    const existingUser = await this.prisma.exam_front_user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      this.logger.warn(`删除失败，用户不存在，ID: ${id}`);
      throw new BadRequestException('用户不存在');
    }

    // 删除用户
    await this.prisma.exam_front_user.delete({
      where: { id },
    });

    this.logger.log(`用户删除成功，ID: ${id}`);
    return { success: true };
  }
}
