import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EvidenceService } from './evidence.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { UpdateEvidenceDto } from './dto/update-evidence.dto';

@ApiTags('evidence')
@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post()
  @ApiOperation({ summary: 'Create evidence' })
  create(@Body() dto: CreateEvidenceDto) {
    return this.evidenceService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List evidence' })
  findAll(
    @Query('category') category?: string,
    @Query('accountId') accountId?: string,
    @Query('search') search?: string,
  ) {
    return this.evidenceService.findAll({ category, accountId, search });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search evidence' })
  search(@Query('q') q?: string, @Query('category') category?: string) {
    return this.evidenceService.findAll({ search: q, category });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get evidence' })
  findOne(@Param('id') id: string) {
    return this.evidenceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update evidence' })
  update(@Param('id') id: string, @Body() dto: UpdateEvidenceDto) {
    return this.evidenceService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete evidence' })
  remove(@Param('id') id: string) {
    return this.evidenceService.remove(id);
  }
}
