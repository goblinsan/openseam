import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssessmentDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() organizationName: string;
  @ApiProperty() @IsString() projectName: string;
  @ApiPropertyOptional() @IsString() @IsOptional() intakeId?: string;
}
