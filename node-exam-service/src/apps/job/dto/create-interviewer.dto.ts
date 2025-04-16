import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { Gender } from '../../../common/enums/gender.enum';

export class CreateInterviewerDto {
  @IsOptional()
  @IsEnum(Gender, { message: '性别不是有效的枚举值' })
  gender?: Gender;

  @IsNotEmpty({ message: '职位不能为空' })
  @IsString({ message: '职位必须是字符串' })
  position: string;
} 