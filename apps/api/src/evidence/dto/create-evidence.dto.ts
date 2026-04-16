import { IsString, IsArray, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEvidenceDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty()
  @IsIn([
    'customer_interview', 'market_research', 'architecture_assessment',
    'portability_risk', 'compliance_requirement', 'product_feedback',
    'competitive_analysis', 'strategic_hypothesis',
  ])
  category: string;
  @ApiProperty() @IsString() sourceType: string;
  @ApiPropertyOptional() @IsString() @IsOptional() sourceReference?: string;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() tags?: string[];
  @ApiPropertyOptional() @IsString() @IsOptional() accountId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() opportunityId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() interviewId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() hypothesisId?: string;
  @ApiPropertyOptional() @IsIn(['low', 'medium', 'high']) @IsOptional() confidence?: string;
  @ApiPropertyOptional() @IsIn(['low', 'medium', 'high']) @IsOptional() impact?: string;
  @ApiProperty() @IsString() createdBy: string;
}
