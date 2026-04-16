import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateArtifactDto {
  @ApiProperty({ enum: ['manifest', 'pattern', 'blueprint', 'adapter', 'policy'] })
  @IsString()
  @IsIn(['manifest', 'pattern', 'blueprint', 'adapter', 'policy'])
  artifactType: string;

  @ApiProperty()
  payload: unknown;
}
