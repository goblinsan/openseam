import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePatternDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() category: string;
  @ApiProperty() @IsString() description: string;
  @ApiPropertyOptional() @IsString() @IsOptional() portability?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() version?: string;
  @ApiPropertyOptional() @IsArray() @IsOptional() interfaces?: string[];
  @ApiPropertyOptional() @IsArray() @IsOptional() dependencies?: string[];
  @ApiPropertyOptional() @IsOptional() providers?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() artifacts?: Record<string, unknown>;
  @ApiPropertyOptional() @IsArray() @IsOptional() tags?: string[];
}
