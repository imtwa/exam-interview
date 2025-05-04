import { IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum FavoriteSortField {
  CREATED_AT = 'createdAt',
  FAVORITE_CREATED_AT = 'favoriteCreatedAt',
}

export class QueryUserFavoritesDto {
  @ApiProperty({
    description: '用户ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: '用户ID必须是整数' })
  @Min(1, { message: '用户ID必须大于0' })
  @Transform(({ value }) => {
    if (value === undefined || value === '') return undefined;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  })
  userId?: number;

  @ApiProperty({
    description: '页码',
    example: 1,
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须大于0' })
  @Transform(({ value }) => {
    if (value === undefined || value === '') return 1;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 1 : parsed;
  })
  page?: number = 1;

  @ApiProperty({
    description: '每页数量',
    example: 10,
    required: false,
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量必须大于0' })
  @Transform(({ value }) => {
    if (value === undefined || value === '') return 10;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 10 : parsed;
  })
  pageSize?: number = 10;

  @ApiProperty({
    description: '排序字段',
    example: FavoriteSortField.FAVORITE_CREATED_AT,
    required: false,
    default: FavoriteSortField.FAVORITE_CREATED_AT,
    enum: FavoriteSortField,
  })
  @IsOptional()
  @IsEnum(FavoriteSortField, { message: '排序字段无效' })
  sortField?: FavoriteSortField = FavoriteSortField.FAVORITE_CREATED_AT;

  @ApiProperty({
    description: '排序方式',
    example: 'desc',
    required: false,
    default: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: '排序方式必须是asc或desc' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}
