import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePatternDto {
  @ApiPropertyOptional() @IsString() @IsOptional() name?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() category?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() portability?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() version?: string;
  @ApiPropertyOptional() @IsArray() @IsOptional() interfaces?: string[];
  @ApiPropertyOptional() @IsArray() @IsOptional() dependencies?: string[];
  @ApiPropertyOptional() @IsOptional() providers?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() artifacts?: Record<string, unknown>;
  @ApiPropertyOptional() @IsArray() @IsOptional() tags?: string[];
}
