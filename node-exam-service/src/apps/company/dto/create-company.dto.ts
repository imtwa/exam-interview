import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt } from 'class-validator';
import { FundingStage, CompanySize } from '../../../../prisma/generated/client';

export class CreateCompanyDto {
  @ApiProperty({ description: '公司名称', example: '字节跳动' })
  @IsString({ message: '公司名称必须是字符串' })
  name: string;

  @ApiProperty({
    description: '公司简介',
    example: '字节跳动是全球领先的科技公司...',
    required: false,
  })
  @IsString({ message: '公司简介必须是字符串' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '公司地址',
    example: '北京市海淀区...',
    required: false,
  })
  @IsString({ message: '公司地址必须是字符串' })
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: '融资阶段',
    enum: FundingStage,
    example: FundingStage.SERIES_D,
    required: false,
  })
  @IsEnum(FundingStage, { message: '融资阶段不是有效的枚举值' })
  @IsOptional()
  fundingStage?: FundingStage;

  @ApiProperty({
    description: '公司规模',
    enum: CompanySize,
    example: CompanySize.XLARGE,
    required: false,
  })
  @IsEnum(CompanySize, { message: '公司规模不是有效的枚举值' })
  @IsOptional()
  size?: CompanySize;

  @ApiProperty({
    description: '行业ID',
    example: 1,
    required: false,
  })
  @IsInt({ message: '行业ID必须是整数' })
  @IsOptional()
  industryId?: number;

  @ApiProperty({
    description: '成立年份',
    example: 2012,
    required: false,
  })
  @IsInt({ message: '成立年份必须是整数' })
  @IsOptional()
  foundedYear?: number;
}
