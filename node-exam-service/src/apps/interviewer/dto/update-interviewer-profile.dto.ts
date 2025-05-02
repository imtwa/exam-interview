import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsInt,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInterviewerDto } from './create-interviewer.dto';
import { CreateCompanyDto } from '../../company/dto/create-company.dto';

export class UpdateInterviewerProfileDto {
  @ApiProperty({
    description: '面试官信息',
    example: {
      position: 'HR经理',
      gender: 'MALE',
    },
  })
  @IsObject({ message: '面试官信息必须是对象' })
  @ValidateNested()
  @Type(() => CreateInterviewerDto)
  interviewer: CreateInterviewerDto;

  @ApiProperty({
    description: '是否使用已存在的公司',
    example: true,
    required: true,
  })
  @IsBoolean({ message: '必须指定是否使用现有公司' })
  useExistingCompany: boolean;

  @ApiProperty({
    description: '现有公司ID',
    example: 1,
    required: false,
  })
  @ValidateIf((o) => o.useExistingCompany === true)
  @IsInt({ message: '公司ID必须是整数' })
  @IsOptional()
  existingCompanyId?: number;

  @ApiProperty({
    description: '新公司信息',
    example: {
      name: '示例公司',
      industry: '互联网',
      address: '北京市海淀区',
      size: 'MEDIUM',
      fundingStage: 'SERIES_A',
      foundedYear: 2010,
    },
    required: false,
  })
  @ValidateIf((o) => o.useExistingCompany === false)
  @IsObject({ message: '公司信息必须是对象' })
  @ValidateNested()
  @Type(() => CreateCompanyDto)
  @IsOptional()
  company?: CreateCompanyDto;
}
