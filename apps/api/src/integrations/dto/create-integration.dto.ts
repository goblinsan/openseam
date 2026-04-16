import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIntegrationDto {
  @ApiProperty() @IsString() projectId: string;
  @ApiProperty() @IsString() repositoryUrl: string;
  @ApiPropertyOptional() @IsString() @IsOptional() provider?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() defaultBranch?: string;
}
