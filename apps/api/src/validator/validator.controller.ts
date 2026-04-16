import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ValidatorService } from './validator.service';
import { ValidateArtifactDto } from './dto/validate-artifact.dto';

@ApiTags('validate')
@Controller('validate')
export class ValidatorController {
  constructor(private readonly validatorService: ValidatorService) {}

  @Post('manifest')
  @ApiOperation({ summary: 'Validate an architecture manifest' })
  validateManifest(@Body() body: { payload: unknown }) {
    return this.validatorService.validate('manifest', body.payload ?? body);
  }

  @Post('pattern')
  @ApiOperation({ summary: 'Validate a pattern definition' })
  validatePattern(@Body() body: { payload: unknown }) {
    return this.validatorService.validate('pattern', body.payload ?? body);
  }

  @Post('blueprint')
  @ApiOperation({ summary: 'Validate a Terraform blueprint' })
  validateBlueprint(@Body() body: { payload: unknown }) {
    return this.validatorService.validate('blueprint', body.payload ?? body);
  }

  @Post('adapters')
  @ApiOperation({ summary: 'Validate adapter SDK implementations' })
  validateAdapters(@Body() body: { payload: unknown }) {
    return this.validatorService.validate('adapter', body.payload ?? body);
  }

  @Post('policies')
  @ApiOperation({ summary: 'Validate governance policies' })
  validatePolicies(@Body() body: { payload: unknown }) {
    return this.validatorService.validate('policy', body.payload ?? body);
  }

  @Post()
  @ApiOperation({ summary: 'Validate any artifact' })
  validate(@Body() dto: ValidateArtifactDto) {
    return this.validatorService.validate(dto.artifactType, dto.payload);
  }

  @Get('rules')
  @ApiOperation({ summary: 'List validation rules' })
  listRules() {
    return this.validatorService.listRules();
  }
}
