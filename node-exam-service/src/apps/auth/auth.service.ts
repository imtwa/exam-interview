import { Injectable, Inject, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '../../../prisma/generated/client';
import * as bcrypt from 'bcryptjs';
import * as svgCaptcha from 'svg-captcha';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '../../common/logger/logger.service';
import { RedisService } from '../redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  private readonly logger: LoggerService;

  constructor(
    @Inject('PRISMA_CLIENT')
    private prisma: PrismaClient,
    private jwtService: JwtService,
    private loggerService: LoggerService,
    private redisService: RedisService,
    private emailService: EmailService,
  ) {
    this.logger = loggerService;
    this.logger.setContext('AuthService');
  }

  // 图片验证码
  async getImageCaptcha() {
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
    
    this.logger.log(`生成图片验证码: ${captchaId}`);
    
    // 返回验证码信息
    return {
      id: captchaId,
      img: captcha.data,
      contentType: 'image/svg+xml'
    };
  }

  // 发送邮箱验证码
  async sendEmailCode(email: string) {
    if (!email) {
      throw new BadRequestException('邮箱地址不能为空');
    }

    // 生成6位随机验证码
    const code = Math.random().toString().slice(2, 8);
    
    // 存储验证码到Redis，有效期5分钟
    await this.redisService.set(`email_code_${email}`, code, 5 * 60);
    
    // 发送验证码邮件
    await this.emailService.sendMail({
      to: email,
      subject: '验证码',
      html: `<p>您的验证码是: <strong>${code}</strong>，有效期5分钟。</p>`
    });
    
    this.logger.log(`发送邮箱验证码: ${email}`);
    
    return {
      email,
      message: '验证码已发送，请查收邮件'
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password, captchaId, captcha } = loginDto;
    
    // 验证图片验证码
    const isValid = await this.validateCaptcha(captchaId, captcha);
    if (!isValid) {
      this.logger.warn(`登录失败，验证码不正确: ${email}`);
      throw new UnauthorizedException('验证码不正确或已过期');
    }

    // 查找用户
    const user = await this.prisma.frontUser.findUnique({
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
    
    // 生成JWT
    const payload = { email: user.email, sub: user.id };
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateCaptcha(captchaId: string, captcha: string): Promise<boolean> {
    const cacheKey = `img_captcha_${captchaId}`;
    const cacheCaptcha = await this.redisService.get(cacheKey);
    
    if (!cacheCaptcha) {
      this.logger.warn(`图片验证码已过期: ${captchaId}`);
      return false;
    }
    
    const isValid = captcha.toLowerCase() === cacheCaptcha;
    
    if (isValid) {
      // 验证成功后设置缓存过期
      await this.redisService.expire(cacheKey, 1);
      this.logger.log(`验证码验证成功: ${captchaId}`);
    } else {
      this.logger.warn(`图片验证码不正确: 预期: ${cacheCaptcha}, 实际: ${captcha.toLowerCase()}`);
    }
    
    return isValid;
  }

  async validateEmailCode(email: string, code: string): Promise<boolean> {
    const cacheCode = await this.redisService.get(`email_code_${email}`);
    if (!cacheCode) {
      this.logger.warn(`邮箱验证码不存在或已过期: ${email}`);
      return false;
    }

    const isValid = code === cacheCode;
    if (!isValid) {
      this.logger.warn(`邮箱验证码不正确: ${email}, 预期: ${cacheCode}, 实际: ${code}`);
    } else {
      this.logger.log(`邮箱验证码验证成功: ${email}`);
    }
    
    return isValid;
  }

  async clearEmailCode(email: string): Promise<void> {
    await this.redisService.set(`email_code_${email}`, '', 1);
    this.logger.log(`清除邮箱验证码: ${email}`);
  }

  async register(registerDto: RegisterDto) {
    const { username, email, password, code, role } = registerDto;
    this.logger.log(`用户注册请求: ${email}, 角色: ${role}`);

    // 验证邮箱验证码
    const isCodeValid = await this.validateEmailCode(email, code);
    if (!isCodeValid) {
      throw new BadRequestException('邮箱验证码不正确或已过期');
    }

    // 检查用户名和邮箱是否已存在
    const existingUser = await this.prisma.frontUser.findFirst({
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
    const user = await this.prisma.frontUser.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
      },
    });
    this.logger.log(`用户注册成功: ${email}, ID: ${user.id}, 角色: ${user.role}`);

    // 清除邮箱验证码
    await this.clearEmailCode(email);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, code } = resetPasswordDto;
    this.logger.log(`密码重置请求: ${email}`);

    // 验证邮箱验证码
    const isCodeValid = await this.validateEmailCode(email, code);
    if (!isCodeValid) {
      throw new BadRequestException('邮箱验证码不正确或已过期');
    }

    // 查找用户
    const user = await this.prisma.frontUser.findUnique({
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
    await this.prisma.frontUser.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    this.logger.log(`密码重置成功: ${email}`);

    // 清除邮箱验证码
    await this.clearEmailCode(email);

    return {
      message: '密码重置成功',
      email,
      password: defaultPassword,
    };
  }

  // 根据用户ID获取用户信息
  async getUserById(userId: number) {
    this.logger.log(`获取用户信息: ID ${userId}`);
    
    const user = await this.prisma.frontUser.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      this.logger.warn(`获取用户信息失败，用户不存在: ID ${userId}`);
      throw new BadRequestException('用户不存在');
    }
    
    return user;
  }
} 