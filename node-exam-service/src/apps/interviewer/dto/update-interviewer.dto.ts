import { PartialType } from '@nestjs/swagger';
import { CreateInterviewerDto } from '../../job/dto/create-interviewer.dto';

export class UpdateInterviewerDto extends PartialType(CreateInterviewerDto) {}
