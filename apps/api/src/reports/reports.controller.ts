import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post(':assessmentId/generate')
  @ApiOperation({ summary: 'Generate advisory report for assessment' })
  generate(@Param('assessmentId') assessmentId: string) {
    return this.reportsService.generate(assessmentId);
  }

  @Get()
  @ApiOperation({ summary: 'List all reports' })
  findAll() {
    return this.reportsService.findAll();
  }

  @Get('assessment/:assessmentId')
  @ApiOperation({ summary: 'Get reports for assessment' })
  findByAssessment(@Param('assessmentId') assessmentId: string) {
    return this.reportsService.findByAssessment(assessmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }
}
