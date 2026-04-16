import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Post(':assessmentId/generate')
  @ApiOperation({ summary: 'Generate recommendations for assessment' })
  generate(@Param('assessmentId') assessmentId: string) {
    return this.recommendationsService.generate(assessmentId);
  }

  @Get(':assessmentId')
  @ApiOperation({ summary: 'Get recommendations for assessment' })
  findByAssessment(@Param('assessmentId') assessmentId: string) {
    return this.recommendationsService.findByAssessment(assessmentId);
  }
}
