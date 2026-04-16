import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApprovalDto {
  @ApiProperty() @IsString() workflowId: string;
  @ApiProperty() @IsString() approverId: string;
  @ApiPropertyOptional() @IsString() @IsOptional() comments?: string;
}
