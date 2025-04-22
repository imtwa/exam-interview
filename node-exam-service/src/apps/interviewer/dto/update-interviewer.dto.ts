import { PartialType } from '@nestjs/swagger';
import { CreateInterviewerDto } from './create-interviewer.dto';

export class UpdateInterviewerDto extends PartialType(CreateInterviewerDto) {}
