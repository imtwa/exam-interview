import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
  IsDate,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../../../common/enums/gender.enum';
import { Degree } from '../../../common/enums/degree.enum';

/**
 * 基本信息DTO
 */
export class BasicInfoDto {
  @IsEnum(Gender, { message: '性别必须是有效的枚举值' })
  @IsNotEmpty({ message: '性别不能为空' })
  gender: Gender;

  @IsDate({ message: '出生日期必须是有效的日期' })
  @Type(() => Date)
  @IsOptional()
  birthday?: Date;

  @IsString({ message: '地址必须是字符串' })
  @IsOptional()
  address?: string;
}

/**
 * 教育经历DTO
 */
export class EducationDto {
  @IsEnum(Degree, { message: '学历必须是有效的枚举值' })
  @IsNotEmpty({ message: '学历不能为空' })
  degree: Degree;

  @IsString({ message: '学校名称必须是字符串' })
  @IsNotEmpty({ message: '学校名称不能为空' })
  school: string;

  @IsString({ message: '专业必须是字符串' })
  @IsNotEmpty({ message: '专业不能为空' })
  major: string;

  @IsDate({ message: '入学时间必须是有效的日期' })
  @Type(() => Date)
  @IsNotEmpty({ message: '入学时间不能为空' })
  startDate: Date;

  @IsDate({ message: '毕业时间必须是有效的日期' })
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;
}

/**
 * 工作经验DTO
 */
export class WorkExperienceDto {
  @IsString({ message: '公司名称必须是字符串' })
  @IsNotEmpty({ message: '公司名称不能为空' })
  company: string;

  @IsString({ message: '职位必须是字符串' })
  @IsNotEmpty({ message: '职位不能为空' })
  position: string;

  @IsDate({ message: '入职时间必须是有效的日期' })
  @Type(() => Date)
  @IsNotEmpty({ message: '入职时间不能为空' })
  startDate: Date;

  @IsDate({ message: '离职时间必须是有效的日期' })
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsString({ message: '工作描述必须是字符串' })
  @IsOptional()
  description?: string;
}

/**
 * 求职意向DTO
 */
export class JobIntentionDto {
  @IsString({ message: '期望职位必须是字符串' })
  @IsNotEmpty({ message: '期望职位不能为空' })
  expectedPosition: string;

  @IsString({ message: '期望工作城市必须是字符串' })
  @IsOptional()
  expectedWorkCity?: string;

  @IsNumber({}, { message: '当前薪资必须是数字' })
  @IsOptional()
  currentSalary?: number;

  @IsNumber({}, { message: '期望薪资必须是数字' })
  @IsOptional()
  expectedSalary?: number;
}

/**
 * 求职者资料设置DTO
 */
export class JobSeekerProfileDto {
  @ValidateNested()
  @Type(() => BasicInfoDto)
  basic: BasicInfoDto;

  @ValidateNested()
  @Type(() => EducationDto)
  @IsOptional()
  education?: EducationDto;

  @ValidateNested()
  @Type(() => WorkExperienceDto)
  @IsOptional()
  experience?: WorkExperienceDto;

  @ValidateNested()
  @Type(() => JobIntentionDto)
  @IsOptional()
  jobIntention?: JobIntentionDto;
}
