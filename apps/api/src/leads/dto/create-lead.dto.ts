import { IsString, IsArray, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeadDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() email: string;
  @ApiPropertyOptional() @IsString() @IsOptional() company?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() source?: string;
  @ApiPropertyOptional()
  @IsIn(['new', 'contacted', 'qualified', 'converted', 'lost'])
  @IsOptional()
  status?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() notes?: string;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() tags?: string[];
}
