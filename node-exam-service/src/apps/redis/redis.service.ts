import { Inject, Injectable, Logger } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
    private readonly logger = new Logger(RedisService.name);

    @Inject('REDIS_CLIENT') 
    private redisClient: RedisClientType;

    async get(key: string) {
        try {
            return await this.redisClient.get(key);
        } catch (error) {
            this.logger.error(`获取键值失败 [${key}]: ${error.message}`);
            return null;
        }
    }

    async set(key: string, value: string | number, ttl?: number) {
        try {
            await this.redisClient.set(key, value);

            if(ttl) {
                await this.redisClient.expire(key, ttl);
            }
            return true;
        } catch (error) {
            this.logger.error(`设置键值失败 [${key}]: ${error.message}`);
            return false;
        }
    }

    async delete(key: string) {
        try {
            return await this.redisClient.del(key);
        } catch (error) {
            this.logger.error(`删除键值失败 [${key}]: ${error.message}`);
            return 0;
        }
    }

    async isConnected(): Promise<boolean> {
        try {
            // 执行一个简单的PING命令检查连接状态
            const result = await this.redisClient.ping();
            return result === 'PONG';
        } catch (error) {
            this.logger.error(`连接检查失败: ${error.message}`);
            return false;
        }
    }
}
