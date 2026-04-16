import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MigrationsService } from './migrations.service';
import { CreateMigrationScenarioDto } from './dto/create-migration-scenario.dto';

@ApiTags('migrations')
@Controller('migrations')
export class MigrationsController {
  constructor(private readonly migrationsService: MigrationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a migration scenario' })
  create(@Body() dto: CreateMigrationScenarioDto) {
    return this.migrationsService.createScenario(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List migration scenarios' })
  @ApiQuery({ name: 'projectId', required: false })
  findAll(@Query('projectId') projectId?: string) {
    return this.migrationsService.listScenarios(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get scenario details' })
  findOne(@Param('id') id: string) {
    return this.migrationsService.getScenario(id);
  }

  @Post(':id/simulate')
  @ApiOperation({ summary: 'Run a migration simulation' })
  simulate(@Param('id') id: string) {
    return this.migrationsService.simulate(id);
  }

  @Get(':id/report')
  @ApiOperation({ summary: 'Get migration report' })
  getReport(@Param('id') id: string) {
    return this.migrationsService.getReport(id);
  }

  @Get(':id/mappings')
  @ApiOperation({ summary: 'Get service mappings for a migration' })
  getMappings(@Param('id') id: string) {
    return this.migrationsService.getMappings(id);
  }
}
