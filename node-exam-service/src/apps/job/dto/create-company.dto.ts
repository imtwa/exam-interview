import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { FundingStage } from '../../../common/enums/funding-stage.enum';
import { CompanySize } from '../../../common/enums/company-size.enum';

export class CreateCompanyDto {
  @IsNotEmpty({ message: '公司名称不能为空' })
  @IsString({ message: '公司名称必须是字符串' })
  name: string;

  @IsOptional()
  @IsString({ message: '公司简介必须是字符串' })
  description?: string;

  @IsOptional()
  @IsString({ message: '公司地址必须是字符串' })
  address?: string;

  @IsOptional()
  @IsEnum(FundingStage, { message: '融资阶段不是有效的枚举值' })
  fundingStage?: FundingStage;

  @IsOptional()
  @IsEnum(CompanySize, { message: '公司规模不是有效的枚举值' })
  size?: CompanySize;

  @IsOptional()
  @IsString({ message: '所属行业必须是字符串' })
  industry?: string;

  @IsOptional()
  @IsInt({ message: '成立年份必须是整数' })
  @Min(1900, { message: '成立年份不能早于1900年' })
  @Max(new Date().getFullYear(), { message: '成立年份不能晚于当前年份' })
  foundedYear?: number;
}
