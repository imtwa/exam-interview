import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt } from 'class-validator';
import { Gender } from '../../../../prisma/generated/client';
export class CreateInterviewerDto {
  @ApiProperty({ description: '职位', example: 'HR经理' })
  @IsString({ message: '职位必须是字符串' })
  position: string;

  @ApiProperty({
    description: '性别',
    enum: Gender,
    example: Gender.MALE,
    required: false,
  })
  @IsEnum(Gender, { message: '性别不是有效的枚举值' })
  @IsOptional()
  gender?: Gender;

  @ApiProperty({
    description: '所属公司ID',
    example: 1,
  })
  @IsInt({ message: '公司ID必须是整数' })
  companyId: number;
}
