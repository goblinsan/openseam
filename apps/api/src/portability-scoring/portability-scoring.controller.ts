import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PortabilityScoringService } from './portability-scoring.service';

@ApiTags('portability-scoring')
@Controller('portability-scoring')
export class PortabilityScoringController {
  constructor(private readonly service: PortabilityScoringService) {}

  @Post(':assessmentId/calculate')
  @ApiOperation({ summary: 'Calculate portability score for assessment' })
  calculate(@Param('assessmentId') assessmentId: string) {
    return this.service.calculate(assessmentId);
  }

  @Get(':assessmentId')
  @ApiOperation({ summary: 'Get portability score for assessment' })
  findOne(@Param('assessmentId') assessmentId: string) {
    return this.service.findOne(assessmentId);
  }
}
