import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty() @IsString() accountId: string;
  @ApiProperty() @IsString() firstName: string;
  @ApiProperty() @IsString() lastName: string;
  @ApiProperty() @IsString() email: string;
  @ApiPropertyOptional() @IsString() @IsOptional() role?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() phone?: string;
}
