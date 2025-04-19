import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateIndustrySubCategoryDto {
  @IsNotEmpty({ message: '子分类名称不能为空' })
  @IsString({ message: '子分类名称必须是字符串' })
  name: string;

  @IsOptional()
  @IsString({ message: '子分类描述必须是字符串' })
  description?: string;
}
