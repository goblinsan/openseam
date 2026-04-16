import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InterviewsService } from './interviews.service';
import { CreateInterviewTemplateDto } from './dto/create-interview-template.dto';
import { UpdateInterviewTemplateDto } from './dto/update-interview-template.dto';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';

@ApiTags('interviews')
@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  // Template endpoints
  @Post('templates')
  @ApiOperation({ summary: 'Create interview template' })
  createTemplate(@Body() dto: CreateInterviewTemplateDto) {
    return this.interviewsService.createTemplate(dto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List interview templates' })
  findAllTemplates() {
    return this.interviewsService.findAllTemplates();
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get interview template' })
  findOneTemplate(@Param('id') id: string) {
    return this.interviewsService.findOneTemplate(id);
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'Update interview template' })
  updateTemplate(@Param('id') id: string, @Body() dto: UpdateInterviewTemplateDto) {
    return this.interviewsService.updateTemplate(id, dto);
  }

  // Interview endpoints
  @Post()
  @ApiOperation({ summary: 'Create interview' })
  create(@Body() dto: CreateInterviewDto) {
    return this.interviewsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List interviews' })
  findAll(@Query('accountId') accountId?: string, @Query('status') status?: string) {
    return this.interviewsService.findAll({ accountId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get interview' })
  findOne(@Param('id') id: string) {
    return this.interviewsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update interview' })
  update(@Param('id') id: string, @Body() dto: UpdateInterviewDto) {
    return this.interviewsService.update(id, dto);
  }
}
