import { IsString, IsBoolean, IsNumber, IsOptional, IsIn, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOpportunityDto {
  @ApiProperty() @IsString() accountId: string;
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional()
  @IsIn(['prospect', 'qualified', 'design_partner', 'closed_won', 'closed_lost'])
  @IsOptional()
  stage?: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() value?: number;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isDesignPartner?: boolean;
  @ApiPropertyOptional() @IsDateString() @IsOptional() closeDate?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() notes?: string;
}
