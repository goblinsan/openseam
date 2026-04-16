import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMigrationScenarioDto {
  @ApiProperty() @IsString() projectId: string;
  @ApiProperty() @IsString() sourceProvider: string;
  @ApiProperty() @IsString() targetProvider: string;
}
