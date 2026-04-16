import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePipelineRunDto {
  @ApiProperty() @IsString() integrationId: string;
  @ApiProperty() @IsString() commitSha: string;
  @ApiPropertyOptional() @IsString() @IsOptional() resultsUrl?: string;
}
