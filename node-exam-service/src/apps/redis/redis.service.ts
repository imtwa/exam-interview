import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { LoggerService } from '../../common/logger/logger.service';

@Injectable()
export class RedisService {
    private readonly logger: LoggerService;

    constructor(private loggerService: LoggerService) {
        this.logger = loggerService;
        this.logger.setContext('RedisService');
    }

    @Inject('REDIS_CLIENT') 
    private redisClient: RedisClientType;

    async get(key: string) {
        try {
            this.logger.debug(`获取键值: ${key}`);
            return await this.redisClient.get(key);
        } catch (error) {
            this.logger.error(`获取键值失败 [${key}]`, error);
            return null;
        }
    }

    async set(key: string, value: string | number, ttl?: number) {
        try {
            this.logger.debug(`设置键值: ${key}, ${ttl ? `TTL: ${ttl}秒` : '无过期时间'}`);
            await this.redisClient.set(key, value);

            if(ttl) {
                await this.redisClient.expire(key, ttl);
            }
            return true;
        } catch (error) {
            this.logger.error(`设置键值失败 [${key}]`, error);
            return false;
        }
    }

    async delete(key: string) {
        try {
            this.logger.debug(`删除键值: ${key}`);
            return await this.redisClient.del(key);
        } catch (error) {
            this.logger.error(`删除键值失败 [${key}]`, error);
            return 0;
        }
    }

    async expire(key: string, seconds: number) {
        try {
            this.logger.debug(`设置键值过期时间: ${key}, ${seconds}秒`);
            return await this.redisClient.expire(key, seconds);
        } catch (error) {
            this.logger.error(`设置键值过期时间失败 [${key}]`, error);
            return false;
        }
    }

    async isConnected(): Promise<boolean> {
        try {
            // 执行一个简单的PING命令检查连接状态
            const result = await this.redisClient.ping();
            this.logger.debug('Redis连接检查: ' + result);
            return result === 'PONG';
        } catch (error) {
            this.logger.error(`Redis连接检查失败`, error);
            return false;
        }
    }
}
