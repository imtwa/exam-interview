import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsEnum } from 'class-validator';
import { Degree } from '../../../../prisma/generated/client';

export class CreateEducationDto {
  @ApiProperty({ description: '学校名称', example: '清华大学' })
  @IsString({ message: '学校名称必须是字符串' })
  school: string;

  @ApiProperty({
    description: '学历',
    enum: Degree,
    example: Degree.BACHELOR,
  })
  @IsEnum(Degree, { message: '学历不是有效的枚举值' })
  degree: Degree;

  @ApiProperty({ description: '专业', example: '计算机科学与技术' })
  @IsString({ message: '专业必须是字符串' })
  major: string;

  @ApiProperty({
    description: '开始日期',
    example: '2018-09-01',
  })
  @IsDateString({}, { message: '开始日期格式不正确' })
  startDate: string;

  @ApiProperty({
    description: '结束日期',
    example: '2022-07-01',
    required: false,
  })
  @IsDateString({}, { message: '结束日期格式不正确' })
  endDate?: string;
}
