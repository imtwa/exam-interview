import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Gender } from '../../../common/enums/gender.enum';

/**
 * 创建/更新面试官DTO
 */
export class CreateInterviewerDto {
  @ApiProperty({ description: '职位', example: 'HR经理' })
  @IsString()
  position: string;

  @ApiProperty({
    description: '性别',
    enum: Gender,
    example: Gender.MALE,
    required: false,
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;
}
