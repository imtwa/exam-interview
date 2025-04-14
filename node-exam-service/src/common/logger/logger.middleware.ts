import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { logger } from './logger.config';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // 请求日志
    this.logger.log(`[请求] ${method} ${originalUrl} - ${ip} - ${userAgent}`);
    logger.info('收到请求', { 
      method, 
      url: originalUrl, 
      ip, 
      userAgent, 
      body: method !== 'GET' ? req.body : undefined,
      query: req.query
    });

    // 响应监听
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const responseTime = Date.now() - startTime;
      
      const logMessage = `[响应] ${method} ${originalUrl} ${statusCode} ${contentLength} - ${responseTime}ms`;
      
      // 根据状态码选择日志级别
      if (statusCode >= 500) {
        this.logger.error(logMessage);
        logger.error('服务器错误', { method, url: originalUrl, statusCode, responseTime });
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
        logger.warn('客户端错误', { method, url: originalUrl, statusCode, responseTime });
      } else {
        this.logger.log(logMessage);
        logger.info('请求完成', { method, url: originalUrl, statusCode, responseTime });
      }
    });

    next();
  }
} 