import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VerificationStatus } from '../../../../prisma/generated/client';

export class QueryCompanyDto {
  @ApiProperty({
    description: '当前页码',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须大于等于1' })
  page?: number = 1;

  @ApiProperty({
    description: '每页条数',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: '每页条数必须是整数' })
  @Min(1, { message: '每页条数必须大于等于1' })
  pageSize?: number = 10;

  @ApiProperty({
    description: '公司名称',
    example: '阿里巴巴',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '公司名称必须是字符串' })
  name?: string;

  @ApiProperty({
    description: '所属行业ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: '所属行业ID必须是整数' })
  industryId?: number;

  @ApiProperty({
    description: '验证状态',
    enum: VerificationStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(VerificationStatus, { message: '验证状态不是有效的枚举值' })
  verificationStatus?: VerificationStatus;
}
