import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post(':assessmentId/generate')
  @ApiOperation({ summary: 'Generate portability inventory for assessment' })
  generate(@Param('assessmentId') assessmentId: string) {
    return this.inventoryService.generate(assessmentId);
  }

  @Get(':assessmentId')
  @ApiOperation({ summary: 'Get inventory for assessment' })
  findOne(@Param('assessmentId') assessmentId: string) {
    return this.inventoryService.findOne(assessmentId);
  }
}
