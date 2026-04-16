import { IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWeightsDto {
  @ApiPropertyOptional() @IsNumber() @Min(0) @Max(1) strategicFit?: number;
  @ApiPropertyOptional() @IsNumber() @Min(0) @Max(1) cloudComplexity?: number;
  @ApiPropertyOptional() @IsNumber() @Min(0) @Max(1) vendorLockInRisk?: number;
  @ApiPropertyOptional() @IsNumber() @Min(0) @Max(1) technicalMaturity?: number;
  @ApiPropertyOptional() @IsNumber() @Min(0) @Max(1) revenuePotential?: number;
  @ApiPropertyOptional() @IsNumber() @Min(0) @Max(1) urgency?: number;
  @ApiPropertyOptional() @IsNumber() @Min(0) @Max(1) regulatoryPressure?: number;
  @ApiPropertyOptional() @IsNumber() @Min(0) @Max(1) innovationReadiness?: number;
  @ApiPropertyOptional() @IsNumber() @Min(0) @Max(1) designPartnerPotential?: number;
  @ApiPropertyOptional() @IsNumber() @Min(0) @Max(1) referenceValue?: number;
}
