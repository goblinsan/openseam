import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IntakeService } from './intake.service';
import { CreateIntakeDto } from './dto/create-intake.dto';
import { UpdateIntakeDto } from './dto/update-intake.dto';

@ApiTags('intake')
@Controller('intake')
export class IntakeController {
  constructor(private readonly intakeService: IntakeService) {}

  @Post()
  @ApiOperation({ summary: 'Create architecture intake' })
  create(@Body() dto: CreateIntakeDto) {
    return this.intakeService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List architecture intakes' })
  findAll() {
    return this.intakeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get architecture intake' })
  findOne(@Param('id') id: string) {
    return this.intakeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update architecture intake' })
  update(@Param('id') id: string, @Body() dto: UpdateIntakeDto) {
    return this.intakeService.update(id, dto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit architecture intake' })
  submit(@Param('id') id: string) {
    return this.intakeService.submit(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete architecture intake' })
  remove(@Param('id') id: string) {
    return this.intakeService.remove(id);
  }
}
