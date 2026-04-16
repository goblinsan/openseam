import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty() @IsString() workflowId: string;
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() assigneeId?: string;
  @ApiPropertyOptional() @IsDateString() @IsOptional() dueDate?: string;
}
