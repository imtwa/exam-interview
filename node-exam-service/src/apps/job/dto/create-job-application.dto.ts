import {
  IsNotEmpty,
  IsInt,
  IsString,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobApplicationDto {
  @IsNotEmpty({ message: '职位ID不能为空' })
  @Type(() => Number)
  @IsInt({ message: '职位ID必须是整数' })
  jobId: number;

  @IsOptional()
  @IsString({ message: '求职意向必须是字符串' })
  coverLetter?: string;

  @IsOptional()
  @IsUrl({}, { message: '简历链接必须是有效的URL' })
  resumeUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: '求职信链接必须是有效的URL' })
  coverLetterUrl?: string;

  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  notes?: string;
}
