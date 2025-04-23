import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryIndustryDto {
  @ApiProperty({ description: '当前页码', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须大于0' })
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量必须大于0' })
  pageSize?: number = 10;

  @ApiProperty({
    description: '关键词搜索',
    required: false,
    example: '互联网',
  })
  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  keyword?: string;
}
