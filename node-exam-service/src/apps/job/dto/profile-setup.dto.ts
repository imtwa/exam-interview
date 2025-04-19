import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../../../common/enums/gender.enum';
import { FundingStage } from '../../../common/enums/funding-stage.enum';
import { CompanySize } from '../../../common/enums/company-size.enum';
import { CreateInterviewerDto } from './create-interviewer.dto';
import { CreateCompanyDto } from './create-company.dto';

export class ProfileSetupDto {
  @ValidateNested()
  @Type(() => CreateInterviewerDto)
  interviewer: CreateInterviewerDto;

  @ValidateNested()
  @Type(() => CreateCompanyDto)
  company: CreateCompanyDto;

  @IsOptional()
  @IsInt({ message: '现有公司ID必须是整数' })
  existingCompanyId?: number;

  @IsOptional()
  @IsBoolean({ message: '是否使用现有公司必须是布尔值' })
  useExistingCompany?: boolean = false;
}
