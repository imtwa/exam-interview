import { PartialType } from '@nestjs/swagger';
import { CreateCompanyDto } from '../../job/dto/create-company.dto';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}
