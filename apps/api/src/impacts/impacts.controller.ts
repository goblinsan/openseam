import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ImpactsService } from './impacts.service';
import { AnalyzeImpactDto } from './dto/analyze-impact.dto';

@ApiTags('impacts')
@Controller('impacts')
export class ImpactsController {
  constructor(private readonly impactsService: ImpactsService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze a proposed change and return an impact report' })
  analyze(@Body() dto: AnalyzeImpactDto) {
    return this.impactsService.analyze(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all impact reports' })
  @ApiQuery({ name: 'projectId', required: false })
  findAll(@Query('projectId') projectId?: string) {
    return this.impactsService.listReports(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve an impact report' })
  findOne(@Param('id') id: string) {
    return this.impactsService.getReport(id);
  }
}
