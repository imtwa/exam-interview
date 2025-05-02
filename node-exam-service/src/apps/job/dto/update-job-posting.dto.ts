import { PartialType } from '@nestjs/swagger';
import { CreateJobPostingDto } from './create-job-posting.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { JobStatus } from '../../../../prisma/generated/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateJobPostingDto extends PartialType(CreateJobPostingDto) {
  @ApiProperty({ 
    description: '职位状态', 
    required: false, 
    enum: JobStatus,
    example: JobStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(JobStatus, { message: '职位状态值不合法' })
  status?: JobStatus;
}
