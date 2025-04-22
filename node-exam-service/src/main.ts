import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe, Logger } from '@nestjs/common';
import { logger } from './common/logger/logger.config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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
      forbidNonWhitelisted: false, // 允许未定义的属性存在
      transformOptions: {
        enableImplicitConversion: true, // 启用隐式类型转换
      },
    }),
  );

  // 配置 Swagger
  const config = new DocumentBuilder()
    .setTitle('在线招聘面试平台 API')
    .setDescription('考试和招聘系统的API文档')
    .setVersion('1.0')
    .addTag('auth', '认证相关')
    .addTag('user', '用户相关')
    .addTag('exam', '考试相关')
    .addTag('company', '公司相关')
    .addTag('interview', '面试相关')
    .addTag('Interviewer', '面试官相关')
    .addTag('jobseeker', '求职者相关')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 设置监听地址为IPv4
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const host = process.env.HOST || 'localhost';

  await app.listen(port, host);

  const serverUrl = `http://${host}:${port}`;

  // 使用日志系统记录应用启动信息
  nestLogger.log(`应用已启动: ${serverUrl}`);
  logger.info(`应用已启动: ${serverUrl}`, { context: 'Bootstrap' });
  nestLogger.log(`Swagger文档地址: ${serverUrl}/api/docs`);
}
bootstrap();
