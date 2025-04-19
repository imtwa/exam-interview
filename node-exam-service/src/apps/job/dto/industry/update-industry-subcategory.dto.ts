import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateIndustrySubCategoryDto {
  @IsOptional()
  @IsString({ message: '子分类名称必须是字符串' })
  name?: string;

  @IsOptional()
  @IsString({ message: '子分类描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsInt({ message: '所属分类ID必须是整数' })
  categoryId?: number;
}
