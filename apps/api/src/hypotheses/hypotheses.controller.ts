import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HypothesesService } from './hypotheses.service';
import { CreateHypothesisDto } from './dto/create-hypothesis.dto';
import { UpdateHypothesisDto } from './dto/update-hypothesis.dto';

@ApiTags('hypotheses')
@Controller('hypotheses')
export class HypothesesController {
  constructor(private readonly hypothesesService: HypothesesService) {}

  @Post()
  @ApiOperation({ summary: 'Create hypothesis' })
  create(@Body() dto: CreateHypothesisDto) {
    return this.hypothesesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List hypotheses' })
  findAll(@Query('status') status?: string) {
    return this.hypothesesService.findAll({ status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get hypothesis' })
  findOne(@Param('id') id: string) {
    return this.hypothesesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update hypothesis' })
  update(@Param('id') id: string, @Body() dto: UpdateHypothesisDto) {
    return this.hypothesesService.update(id, dto);
  }
}
