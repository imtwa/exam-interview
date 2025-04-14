import { Injectable, Scope, LoggerService as NestLoggerService } from '@nestjs/common';
import { logger } from './logger.config';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;

  constructor() {
    // 无参数构造函数
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, ...optionalParams: any[]) {
    const context = this.getContext(optionalParams);
    logger.info(message, { context, ...this.parseOptionalParams(optionalParams) });
  }

  error(message: any, ...optionalParams: any[]) {
    const context = this.getContext(optionalParams);
    const stack = this.findStack(optionalParams);
    
    logger.error(message, { 
      context, 
      stack,
      ...this.parseOptionalParams(optionalParams)
    });
  }

  warn(message: any, ...optionalParams: any[]) {
    const context = this.getContext(optionalParams);
    logger.warn(message, { context, ...this.parseOptionalParams(optionalParams) });
  }

  debug(message: any, ...optionalParams: any[]) {
    const context = this.getContext(optionalParams);
    logger.debug(message, { context, ...this.parseOptionalParams(optionalParams) });
  }

  verbose(message: any, ...optionalParams: any[]) {
    const context = this.getContext(optionalParams);
    logger.verbose(message, { context, ...this.parseOptionalParams(optionalParams) });
  }

  private getContext(optionalParams: any[]): string | undefined {
    // 提取上下文
    if (optionalParams.length && typeof optionalParams[optionalParams.length - 1] === 'string') {
      return optionalParams.pop();
    }
    return this.context;
  }

  private findStack(optionalParams: any[]): string | undefined {
    // 查找错误堆栈
    for (const param of optionalParams) {
      if (param instanceof Error) {
        return param.stack;
      }
    }
    
    // 通过构建新的 Error 获取当前调用栈
    const error = new Error();
    return error.stack;
  }

  private parseOptionalParams(optionalParams: any[]): Record<string, any> {
    const params: Record<string, any> = {};
    
    // 处理可选参数
    optionalParams.forEach((param, index) => {
      if (param !== null && typeof param === 'object') {
        if (param instanceof Error) {
          params.error = {
            message: param.message,
            name: param.name,
          };
        } else {
          Object.assign(params, param);
        }
      } else if (param !== undefined) {
        params[`param${index}`] = param;
      }
    });
    
    return params;
  }
} 