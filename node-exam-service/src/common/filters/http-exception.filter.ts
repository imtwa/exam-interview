import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 获取状态码
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 获取错误信息
    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? exceptionResponse['message']
        : exception.message;

    // 构造错误响应
    const errorResponse = {
      code: status,
      data: null,
      message: Array.isArray(message) ? message[0] : message,
    };

    // 记录错误日志
    this.logger.error(
      `${request.method} ${request.url} ${status} - ${message}`,
      exception.stack,
    );

    // 返回统一格式的错误响应
    response.status(status).json(errorResponse);
  }
}
