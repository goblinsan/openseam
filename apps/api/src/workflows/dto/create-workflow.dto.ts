import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkflowDto {
  @ApiProperty() @IsString() projectId: string;
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
}
