import { IsOptional, IsInt, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryJobApplicationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码不能小于1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量不能小于1' })
  @Max(100, { message: '每页数量不能大于100' })
  pageSize?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '职位ID必须是整数' })
  jobId?: number;

  @IsOptional()
  @IsString({ message: '申请状态必须是字符串' })
  status?: string;

  @IsOptional()
  @IsString({ message: '排序字段必须是字符串' })
  sortField?: string = 'appliedAt';

  @IsOptional()
  @IsString({ message: '排序方向必须是字符串' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}
