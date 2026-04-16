import { IsString, IsNumber, IsOptional, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalculateScoreDto {
  @ApiProperty() @IsString() accountId: string;
  @ApiPropertyOptional() @IsString() @IsOptional() opportunityId?: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() @Min(0) @Max(100) strategicFit?: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() @Min(0) @Max(100) cloudComplexity?: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() @Min(0) @Max(100) vendorLockInRisk?: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() @Min(0) @Max(100) technicalMaturity?: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() @Min(0) @Max(100) revenuePotential?: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() @Min(0) @Max(100) urgency?: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() @Min(0) @Max(100) regulatoryPressure?: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() @Min(0) @Max(100) innovationReadiness?: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() @Min(0) @Max(100) designPartnerPotential?: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() @Min(0) @Max(100) referenceValue?: number;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() cloudProviders?: string[];
  @ApiPropertyOptional() @IsString() @IsOptional() industry?: string;
}
