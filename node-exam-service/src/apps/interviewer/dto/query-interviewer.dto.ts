import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VerificationStatus } from '../../../../prisma/generated/client';

export class QueryInterviewerDto {
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
    description: '用户名',
    example: 'johndoe',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '用户名必须是字符串' })
  username?: string;

  @ApiProperty({
    description: '职位',
    example: 'HR经理',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '职位必须是字符串' })
  position?: string;

  @ApiProperty({
    description: '公司ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '公司ID必须是数字' })
  companyId?: number;

  @ApiProperty({
    description: '验证状态',
    enum: VerificationStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(VerificationStatus, { message: '验证状态不是有效的枚举值' })
  verificationStatus?: VerificationStatus;
}
