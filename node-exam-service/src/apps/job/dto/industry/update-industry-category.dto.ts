import { IsString, IsOptional } from 'class-validator';

export class UpdateIndustryCategoryDto {
  @IsOptional()
  @IsString({ message: '分类名称必须是字符串' })
  name?: string;

  @IsOptional()
  @IsString({ message: '分类描述必须是字符串' })
  description?: string;
}
