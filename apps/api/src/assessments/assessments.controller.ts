import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';

@ApiTags('assessments')
@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new assessment' })
  create(@Body() dto: CreateAssessmentDto) {
    return this.assessmentsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all assessments' })
  findAll() {
    return this.assessmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assessment details' })
  findOne(@Param('id') id: string) {
    return this.assessmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update assessment' })
  update(@Param('id') id: string, @Body() dto: UpdateAssessmentDto) {
    return this.assessmentsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete assessment' })
  remove(@Param('id') id: string) {
    return this.assessmentsService.remove(id);
  }
}
