import { IsNotEmpty, IsString, IsInt, IsBoolean, IsOptional, Min, Max, IsEnum } from 'class-validator';
import { Degree } from '../../../common/enums/degree.enum';

export class CreateJobDto {
  @IsNotEmpty({ message: '职位标题不能为空' })
  @IsString({ message: '职位标题必须是字符串' })
  title: string;

  @IsNotEmpty({ message: '公司ID不能为空' })
  @IsInt({ message: '公司ID必须是整数' })
  companyId: number;

  @IsNotEmpty({ message: '面试官ID不能为空' })
  @IsInt({ message: '面试官ID必须是整数' })
  interviewerId: number;

  @IsNotEmpty({ message: '行业分类ID不能为空' })
  @IsInt({ message: '行业分类ID必须是整数' })
  subCategoryId: number;

  @IsNotEmpty({ message: '职位描述不能为空' })
  @IsString({ message: '职位描述必须是字符串' })
  description: string;

  @IsNotEmpty({ message: '职位要求不能为空' })
  @IsString({ message: '职位要求必须是字符串' })
  requirements: string;

  @IsNotEmpty({ message: '工作城市不能为空' })
  @IsString({ message: '工作城市必须是字符串' })
  city: string;

  @IsOptional()
  @IsString({ message: '详细地址必须是字符串' })
  address?: string;

  @IsNotEmpty({ message: '薪资下限不能为空' })
  @IsInt({ message: '薪资下限必须是整数' })
  @Min(0, { message: '薪资下限不能小于0' })
  salaryMin: number;

  @IsNotEmpty({ message: '薪资上限不能为空' })
  @IsInt({ message: '薪资上限必须是整数' })
  @Min(0, { message: '薪资上限不能小于0' })
  salaryMax: number;

  @IsOptional()
  @IsInt({ message: '经验要求必须是整数' })
  @Min(0, { message: '经验要求不能小于0' })
  experienceReq?: number;

  @IsOptional()
  @IsEnum(Degree, { message: '学历要求不是有效的枚举值' })
  educationReq?: Degree;

  @IsOptional()
  @IsBoolean({ message: '是否支持远程必须是布尔值' })
  isRemote?: boolean = false;
} 