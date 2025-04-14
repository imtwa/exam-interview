import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '../../common/logger/logger.module';
import { PrismaClient } from '../../../prisma/generated/client';
import { RedisModule } from '../redis/redis.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    LoggerModule,
    RedisModule,
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'exam-interview-secure-jwt-secret-key',
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: 'PRISMA_CLIENT',
      useValue: new PrismaClient(),
    },
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {} 