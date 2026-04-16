import { Controller, Get, Post, Delete, Body, Param, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { CreatePipelineRunDto } from './dto/create-pipeline-run.dto';

@ApiTags('integrations')
@Controller('integrations/cicd')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a CI/CD integration' })
  create(@Body() dto: CreateIntegrationDto) {
    return this.integrationsService.createIntegration(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List CI/CD integrations' })
  @ApiQuery({ name: 'projectId', required: false })
  findAll(@Query('projectId') projectId?: string) {
    return this.integrationsService.listIntegrations(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get integration details' })
  findOne(@Param('id') id: string) {
    return this.integrationsService.getIntegration(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a CI/CD integration' })
  remove(@Param('id') id: string) {
    return this.integrationsService.deleteIntegration(id);
  }

  @Post('runs')
  @ApiOperation({ summary: 'Create a pipeline run' })
  createRun(@Body() dto: CreatePipelineRunDto) {
    return this.integrationsService.createPipelineRun(dto);
  }

  @Get(':id/runs')
  @ApiOperation({ summary: 'List pipeline runs for an integration' })
  listRuns(@Param('id') id: string) {
    return this.integrationsService.listPipelineRuns(id);
  }

  @Patch('runs/:runId/status')
  @ApiOperation({ summary: 'Update pipeline run status' })
  updateRunStatus(@Param('runId') runId: string, @Body() body: { status: string }) {
    return this.integrationsService.updatePipelineRunStatus(runId, body.status);
  }

  @Get(':id/pr-checks')
  @ApiOperation({ summary: 'List PR checks for an integration' })
  listPrChecks(@Param('id') id: string) {
    return this.integrationsService.listPrChecks(id);
  }
}
