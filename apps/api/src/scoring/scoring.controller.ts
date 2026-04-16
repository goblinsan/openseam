import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ScoringService } from './scoring.service';
import { CalculateScoreDto } from './dto/calculate-score.dto';
import { UpdateWeightsDto } from './dto/update-weights.dto';

@ApiTags('scoring')
@Controller('scoring')
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Get()
  @ApiOperation({ summary: 'List all scores' })
  findAll() {
    return this.scoringService.findAll();
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate opportunity score' })
  calculate(@Body() dto: CalculateScoreDto) {
    return this.scoringService.calculate(dto);
  }

  @Get('rankings')
  @ApiOperation({ summary: 'Get score rankings' })
  getRankings() {
    return this.scoringService.getRankings();
  }

  @Get('weights')
  @ApiOperation({ summary: 'Get current scoring weights' })
  getWeights() {
    return this.scoringService.getWeightsConfig();
  }

  @Patch('weights')
  @ApiOperation({ summary: 'Update scoring weights' })
  updateWeights(@Body() dto: UpdateWeightsDto) {
    return this.scoringService.updateWeights(dto);
  }

  @Get(':accountId')
  @ApiOperation({ summary: 'Get scores for account' })
  findByAccount(@Param('accountId') accountId: string) {
    return this.scoringService.findByAccount(accountId);
  }
}
