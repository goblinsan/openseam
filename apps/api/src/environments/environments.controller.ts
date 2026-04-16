import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { EnvironmentsService } from './environments.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';

@ApiTags('environments')
@Controller('environments')
export class EnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an environment' })
  create(@Body() dto: CreateEnvironmentDto) {
    return this.environmentsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List environments for a project' })
  @ApiQuery({ name: 'projectId', required: true })
  findByProject(@Query('projectId') projectId: string) {
    return this.environmentsService.findByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get environment details' })
  findOne(@Param('id') id: string) {
    return this.environmentsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an environment' })
  remove(@Param('id') id: string) {
    return this.environmentsService.remove(id);
  }
}
