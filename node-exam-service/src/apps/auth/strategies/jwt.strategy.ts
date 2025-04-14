import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../../../../prisma/generated/client';
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
      secretOrKey: configService.get('JWT_SECRET'),
    });
    this.logger = loggerService;
    this.logger.setContext('JwtStrategy');
  }

  async validate(payload: any) {
    // 查找用户
    const user = await this.prisma.frontUser.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      this.logger.warn(`JWT验证失败，用户不存在: ID ${payload.sub}`);
      throw new UnauthorizedException('用户未授权');
    }

    this.logger.log(`JWT验证成功: ${user.email}, ID: ${user.id}`);

    // 返回用户对象（不包含密码）
    const { password, ...result } = user;
    return {
      ...result,
      userId: payload.sub,
    };
  }
}