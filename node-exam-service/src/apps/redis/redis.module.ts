import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import { RedisController } from './redis.controller';
import { createClient } from 'redis';
import { ModuleRef } from '@nestjs/core';

@Global()
@Module({
  controllers: [RedisController],
  providers: [RedisService, {
    provide: 'REDIS_CLIENT',
    inject: [ConfigService],
    async useFactory(configService: ConfigService) {
      const client = createClient({
          socket: {
              host: configService.get('REDIS_HOST') || '127.0.0.1',
              port: configService.get('REDIS_PORT') || 6379,
              reconnectStrategy: (retries) => {
                  // 最大重试次数为10次，每次重试间隔为重试次数 * 1000ms
                  if (retries > 10) {
                      console.error('[Redis] 重连失败次数过多，停止重连');
                      return new Error('Redis重连失败次数过多');
                  }
                  console.log(`[Redis] 尝试重连，第${retries}次`);
                  return retries * 1000; // 重连间隔时间
              },
              connectTimeout: 10000, // 连接超时设置为10秒
          },
          // 禁用自动重连 (使用自定义的重连策略)
          disableOfflineQueue: false,
      });

      // 错误事件处理
      client.on('error', (err) => {
          console.error('[Redis] 连接错误:', err);
      });

      // 重连事件
      client.on('reconnecting', () => {
          console.log('[Redis] 正在重连...');
      });

      // 连接成功
      client.on('connect', () => {
          console.log('[Redis] 连接成功');
      });

      // 连接就绪
      client.on('ready', () => {
          console.log('[Redis] 服务就绪');
      });

      try {
          await client.connect();
          console.log('[Redis] 初始化连接成功');
          return client;
      } catch (error) {
          console.error('[Redis] 初始化连接失败:', error);
          throw error;
      }
    }
  }],
  exports: [RedisService]
})
export class RedisModule implements OnApplicationShutdown {
  constructor(private moduleRef: ModuleRef) {}

  async onApplicationShutdown() {
    // 应用关闭时断开Redis连接
    const client = this.moduleRef.get('REDIS_CLIENT');
    if (client) {
      await client.quit();
      console.log('[Redis] 连接已安全关闭');
    }
  }
}
