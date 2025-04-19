import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseData, ResponseCode } from '../interfaces/response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseData<T>>
{
  private logger = new Logger('Response');

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseData<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        // 记录请求信息
        this.logger.log(
          `${request.method} ${request.url} ${statusCode} - ${request.ip}`,
        );

        // 检查是否已经是标准响应格式
        if (
          data &&
          typeof data === 'object' &&
          'code' in data &&
          'message' in data &&
          'data' in data
        ) {
          // 已经是标准响应格式，直接返回
          return data;
        }

        // 构造统一响应格式
        return {
          code: ResponseCode.SUCCESS,
          data: data || null,
          message: 'Success',
        };
      }),
    );
  }
}
