import { PartialType } from '@nestjs/swagger';
import { CreateIndustryCategoryDto } from './create-industry-category.dto';

export class UpdateIndustryCategoryDto extends PartialType(
  CreateIndustryCategoryDto,
) {}
