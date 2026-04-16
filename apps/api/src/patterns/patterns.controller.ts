import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PatternsService } from './patterns.service';
import { CreatePatternDto } from './dto/create-pattern.dto';
import { UpdatePatternDto } from './dto/update-pattern.dto';

@ApiTags('patterns')
@Controller('patterns')
export class PatternsController {
  constructor(private readonly patternsService: PatternsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pattern' })
  create(@Body() dto: CreatePatternDto) {
    return this.patternsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all patterns' })
  @ApiQuery({ name: 'category', required: false })
  findAll(@Query('category') category?: string) {
    return this.patternsService.findAll(category);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List pattern categories' })
  findCategories() {
    return this.patternsService.findCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pattern details' })
  findOne(@Param('id') id: string) {
    return this.patternsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a pattern' })
  update(@Param('id') id: string, @Body() dto: UpdatePatternDto) {
    return this.patternsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pattern' })
  remove(@Param('id') id: string) {
    return this.patternsService.remove(id);
  }
}
