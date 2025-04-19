import { Module, Global, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { createWinstonLoggerConfig } from './logger.config';
import { LoggerService } from './logger.service';
import { LoggerMiddleware } from './logger.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return createWinstonLoggerConfig(configService);
      },
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
