import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../../../../generated/prisma/client';
import { Inject } from '@nestjs/common';
import { LoggerService } from '../../../common/logger/logger.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger: LoggerService;

  constructor(
    private configService: ConfigService,
    @Inject('PRISMA_CLIENT')
    private prisma: PrismaClient,
    private loggerService: LoggerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'exam-interview-secure-jwt-secret-key',
    });
    this.logger = loggerService;
    this.logger.setContext('JwtStrategy');
  }

  async validate(payload: any) {
    // 通过payload.sub（用户ID）查找用户
    const user = await this.prisma.frontUser.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      this.logger.warn(`用户验证失败，ID不存在: ${payload.sub}`);
      throw new UnauthorizedException('用户不存在或未授权');
    }

    this.logger.log(`JWT验证成功，用户: ${user.email}, ID: ${user.id}`);
    // 返回用户对象（不包含密码）
    const { password, ...result } = user;
    return result;
  }
}