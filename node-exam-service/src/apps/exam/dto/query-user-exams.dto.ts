import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class QueryUserExamsDto {
  @ApiProperty({
    description: '页码',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '') {
      return 1;
    }
    return parseInt(value, 10);
  })
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: '每页条数',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '') {
      return 10;
    }
    return parseInt(value, 10);
  })
  @IsInt()
  @Min(1)
  pageSize: number = 10;
}
