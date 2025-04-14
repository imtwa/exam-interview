import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe, Logger } from '@nestjs/common';
import { logger } from './common/logger/logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const nestLogger = new Logger('Bootstrap');
  
  // 允许跨域
  app.enableCors();
  
  // 应用全局响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // 应用全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // 应用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动移除非DTO中的属性
      transform: true, // 自动转换类型
      forbidNonWhitelisted: true, // 禁止传入非DTO中的字段
      transformOptions: {
        enableImplicitConversion: true, // 启用隐式类型转换
      },
    }),
  );
  
  // 设置监听地址为IPv4
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const host = process.env.HOST || '127.0.0.1';
  
  await app.listen(port, host);
  
  const serverUrl = `http://${host}:${port}`;
  
  // 使用日志系统记录应用启动信息
  nestLogger.log(`应用已启动: ${serverUrl}`);
  logger.info(`应用已启动: ${serverUrl}`, { context: 'Bootstrap' });
}
bootstrap();
