import { PartialType } from '@nestjs/swagger';
import { CreateInterviewTemplateDto } from './create-interview-template.dto';
export class UpdateInterviewTemplateDto extends PartialType(CreateInterviewTemplateDto) {}
