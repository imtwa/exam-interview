import { WinstonModuleOptions } from 'nest-winston';
import { format, transports } from 'winston';
import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

// 为处理中文创建自定义格式化器
const customJsonFormatter = format.printf((info) => {
  const { timestamp, level, message, context, ...rest } = info;
  return JSON.stringify({
    timestamp,
    level,
    message,
    context,
    ...rest,
  });
});

// 创建配置工厂函数
export const createWinstonLoggerConfig = (
  configService: ConfigService,
): WinstonModuleOptions => {
  // 从环境变量读取日志路径，默认为项目根目录下的logs
  const logDirFromEnv = configService.get<string>('LOG_PATH') || 'logs';
  const logDir = path.join(process.cwd(), logDirFromEnv);

  // 确保日志目录存在
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // 日志文件路径
  const errorLogPath = path.join(logDir, 'error.log');
  const combinedLogPath = path.join(logDir, 'combined.log');
  const accessLogPath = path.join(logDir, 'access.log');

  // 自定义日志格式
  const customFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    customJsonFormatter, // 使用自定义格式化器而不是默认的json()
  );

  // 开发环境控制台格式
  const consoleFormat = format.combine(
    format.colorize({ all: true }),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message, context, trace }) => {
      let log = `${timestamp} `;

      if (context) {
        log += `[${context}] `;
      }

      log += `${level}: ${message}`;

      if (trace) {
        log += `\n${trace}`;
      }

      return log;
    }),
  );

  // 日志配置
  return {
    transports: [
      // 错误日志
      new transports.File({
        filename: errorLogPath,
        level: 'error',
        format: customFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 10,
        options: { flags: 'w' }, // 每次启动应用时清空日志文件
      }),

      // 所有日志
      new transports.File({
        filename: combinedLogPath,
        format: customFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 10,
        options: { flags: 'w' }, // 每次启动应用时清空日志文件
      }),

      // 访问日志
      new transports.File({
        filename: accessLogPath,
        format: customFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 10,
        options: { flags: 'w' }, // 每次启动应用时清空日志文件
      }),

      // 控制台输出 (开发环境)
      new transports.Console({
        format: consoleFormat,
      }),
    ],

    // 日志级别
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  };
};

// 创建独立的winston日志实例 (在无法获取ConfigService的地方使用)
const defaultLogDir = process.env.LOG_PATH || path.join(process.cwd(), 'logs');
if (!fs.existsSync(defaultLogDir)) {
  fs.mkdirSync(defaultLogDir, { recursive: true });
}

const errorLogPath = path.join(defaultLogDir, 'error.log');
const combinedLogPath = path.join(defaultLogDir, 'combined.log');

// 自定义格式化
const standaloneFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  customJsonFormatter,
);

// 创建日志记录器实例
export const logger = winston.createLogger({
  format: standaloneFormat,
  transports: [
    new transports.File({
      filename: errorLogPath,
      level: 'error',
      options: { flags: 'w' }, // 每次启动应用时清空日志文件
    }),
    new transports.File({
      filename: combinedLogPath,
      options: { flags: 'w' }, // 每次启动应用时清空日志文件
    }),
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message, context }) => {
          let log = `${timestamp} `;

          if (context) {
            log += `[${context}] `;
          }

          log += `${level}: ${message}`;
          return log;
        }),
      ),
    }),
  ],
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});
