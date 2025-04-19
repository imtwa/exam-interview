import { ResponseCode, ResponseData } from '../interfaces/response.interface';

/**
 * 标准化成功响应
 * @param data 响应数据
 * @param message 响应消息
 * @returns 格式化的响应对象
 */
export function success<T>(data: T, message = 'Success'): ResponseData<T> {
  return {
    code: ResponseCode.SUCCESS,
    data,
    message,
  };
}

/**
 * 标准化错误响应
 * @param code 错误码
 * @param message 错误消息
 * @returns 格式化的错误响应
 */
export function error(
  code = ResponseCode.INTERNAL_ERROR,
  message = 'Error',
): ResponseData<null> {
  return {
    code,
    data: null,
    message,
  };
}

/**
 * 分页响应数据格式化
 * @param list 列表数据
 * @param total 总数
 * @param page 当前页
 * @param pageSize 每页大小
 * @returns 格式化的分页数据
 */
export function pagination<T>(
  list: T[],
  total: number,
  page: number,
  pageSize: number,
): ResponseData<{
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  return success({
    list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
