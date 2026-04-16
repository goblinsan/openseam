import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyzeImpactDto {
  @ApiProperty() @IsString() projectId: string;
  @ApiProperty() @IsString() artifactType: string;
  @ApiPropertyOptional() @IsOptional() before?: unknown;
  @ApiPropertyOptional() @IsOptional() after?: unknown;
}
