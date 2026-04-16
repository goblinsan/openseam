import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInterviewDto {
  @ApiProperty() @IsString() accountId: string;
  @ApiPropertyOptional() @IsString() @IsOptional() opportunityId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() templateId?: string;
  @ApiProperty() @IsString() interviewer: string;
  @ApiProperty() @IsString() interviewee: string;
  @ApiProperty() @IsString() persona: string;
  @ApiPropertyOptional()
  @IsIn(['scheduled', 'completed', 'analyzed'])
  @IsOptional()
  status?: string;
  @ApiProperty() @IsDateString() scheduledAt: string;
  @ApiPropertyOptional() @IsDateString() @IsOptional() completedAt?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() notes?: string;
}
