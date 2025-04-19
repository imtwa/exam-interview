import { Global, Module, OnApplicationShutdown, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import { RedisController } from './redis.controller';
import { createClient } from 'redis';
import { ModuleRef } from '@nestjs/core';
import { logger } from '../../common/logger/logger.config';

@Global()
@Module({
  controllers: [RedisController],
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      async useFactory(configService: ConfigService) {
        const nestLogger = new Logger('Redis');

        const client = createClient({
          socket: {
            host: configService.get('REDIS_HOST') || '127.0.0.1',
            port: configService.get('REDIS_PORT') || 6379,
            reconnectStrategy: (retries) => {
              // 最大重试次数为10次，每次重试间隔为重试次数 * 1000ms
              if (retries > 10) {
                nestLogger.error('重连失败次数过多，停止重连');
                logger.error('重连失败次数过多，停止重连', {
                  context: 'Redis',
                });
                return new Error('Redis重连失败次数过多');
              }
              nestLogger.log(`尝试重连，第${retries}次`);
              logger.info(`尝试重连，第${retries}次`, { context: 'Redis' });
              return retries * 1000; // 重连间隔时间
            },
            connectTimeout: 10000, // 连接超时设置为10秒
          },
          // 禁用自动重连 (使用自定义的重连策略)
          disableOfflineQueue: false,
        });

        // 错误事件处理
        client.on('error', (err) => {
          nestLogger.error(`连接错误: ${err.message}`);
          logger.error('连接错误', { context: 'Redis', error: err });
        });

        // 重连事件
        client.on('reconnecting', () => {
          nestLogger.log('正在重连...');
          logger.info('正在重连...', { context: 'Redis' });
        });

        // 连接成功
        client.on('connect', () => {
          nestLogger.log('连接成功');
          logger.info('连接成功', { context: 'Redis' });
        });

        // 连接就绪
        client.on('ready', () => {
          nestLogger.log('服务就绪');
          logger.info('服务就绪', { context: 'Redis' });
        });

        try {
          await client.connect();
          nestLogger.log('初始化连接成功');
          logger.info('初始化连接成功', { context: 'Redis' });
          return client;
        } catch (error) {
          nestLogger.error(`初始化连接失败: ${error.message}`);
          logger.error('初始化连接失败', { context: 'Redis', error });
          throw error;
        }
      },
    },
  ],
  exports: [RedisService],
})
export class RedisModule implements OnApplicationShutdown {
  private readonly logger = new Logger('Redis');

  constructor(private moduleRef: ModuleRef) {}

  async onApplicationShutdown() {
    // 应用关闭时断开Redis连接
    const client = this.moduleRef.get('REDIS_CLIENT');
    if (client) {
      await client.quit();
      this.logger.log('连接已安全关闭');
      logger.info('连接已安全关闭', { context: 'Redis' });
    }
  }
}
