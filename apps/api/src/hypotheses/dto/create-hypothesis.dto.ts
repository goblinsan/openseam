import { IsString, IsArray, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHypothesisDto {
  @ApiProperty() @IsString() statement: string;
  @ApiPropertyOptional()
  @IsIn(['unvalidated', 'validated', 'invalidated'])
  @IsOptional()
  status?: string;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() evidenceIds?: string[];
}
