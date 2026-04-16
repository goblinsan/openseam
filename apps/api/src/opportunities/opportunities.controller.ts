import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';

@ApiTags('opportunities')
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create opportunity' })
  create(@Body() dto: CreateOpportunityDto) {
    return this.opportunitiesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List opportunities' })
  findAll(
    @Query('stage') stage?: string,
    @Query('isDesignPartner') isDesignPartner?: boolean,
    @Query('accountId') accountId?: string,
  ) {
    return this.opportunitiesService.findAll({ stage, isDesignPartner, accountId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get opportunity' })
  findOne(@Param('id') id: string) {
    return this.opportunitiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update opportunity' })
  update(@Param('id') id: string, @Body() dto: UpdateOpportunityDto) {
    return this.opportunitiesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete opportunity' })
  remove(@Param('id') id: string) {
    return this.opportunitiesService.remove(id);
  }
}
