import { PartialType } from '@nestjs/swagger';
import { CreateIndustrySubCategoryDto } from './create-industry-subcategory.dto';

export class UpdateIndustrySubCategoryDto extends PartialType(
  CreateIndustrySubCategoryDto,
) {}
