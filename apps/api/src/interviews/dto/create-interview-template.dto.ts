import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInterviewTemplateDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() persona: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() questions?: string[];
}
