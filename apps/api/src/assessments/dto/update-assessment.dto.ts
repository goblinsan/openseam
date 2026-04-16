import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAssessmentDto {
  @ApiPropertyOptional() @IsString() @IsOptional() name?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() organizationName?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() projectName?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() status?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() intakeId?: string;
}
