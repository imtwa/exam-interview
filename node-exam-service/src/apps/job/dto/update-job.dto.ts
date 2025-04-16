import { IsString, IsInt, IsBoolean, IsOptional, Min, IsEnum } from 'class-validator';
import { Degree } from '../../../common/enums/degree.enum';
import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from './create-job.dto';

export class UpdateJobDto extends PartialType(CreateJobDto) {
  // 继承CreateJobDto的所有字段，但都是可选的
} 