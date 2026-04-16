import { IsString, IsArray, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIntakeDto {
  @ApiPropertyOptional() @IsString() @IsOptional() accountId?: string;
  @ApiProperty() @IsString() organizationName: string;
  @ApiProperty() @IsString() applicationName: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiProperty() @IsString() primaryContact: string;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() cloudProviders?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() environments?: string[];
  @ApiPropertyOptional() @IsObject() @IsOptional() compute?: Record<string, any>;
  @ApiPropertyOptional() @IsObject() @IsOptional() storage?: Record<string, any>;
  @ApiPropertyOptional() @IsObject() @IsOptional() messaging?: Record<string, any>;
  @ApiPropertyOptional() @IsObject() @IsOptional() identity?: Record<string, any>;
  @ApiPropertyOptional() @IsObject() @IsOptional() networking?: Record<string, any>;
  @ApiPropertyOptional() @IsObject() @IsOptional() cicd?: Record<string, any>;
  @ApiPropertyOptional() @IsObject() @IsOptional() observability?: Record<string, any>;
  @ApiPropertyOptional() @IsObject() @IsOptional() security?: Record<string, any>;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() compliance?: string[];
  @ApiPropertyOptional() @IsString() @IsOptional() dataResidency?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() disasterRecovery?: string;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() integrations?: string[];
  @ApiPropertyOptional() @IsString() @IsOptional() portabilityGoals?: string;
}
