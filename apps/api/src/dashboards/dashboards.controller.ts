import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DashboardsService } from './dashboards.service';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve executive dashboard' })
  @ApiQuery({ name: 'workspaceId', required: false })
  getExecutiveDashboard(@Query('workspaceId') workspaceId?: string) {
    return this.dashboardsService.getExecutiveDashboard(workspaceId);
  }

  @Get('portfolio')
  @ApiOperation({ summary: 'Portfolio metrics' })
  @ApiQuery({ name: 'workspaceId', required: false })
  getPortfolio(@Query('workspaceId') workspaceId?: string) {
    return this.dashboardsService.getPortfolioMetrics(workspaceId);
  }

  @Get('risks')
  @ApiOperation({ summary: 'Risk metrics' })
  getRisks() {
    return this.dashboardsService.getRiskMetrics();
  }

  @Get('providers')
  @ApiOperation({ summary: 'Provider distribution' })
  getProviders() {
    return this.dashboardsService.getProviderMetrics();
  }

  @Get('governance')
  @ApiOperation({ summary: 'Governance metrics' })
  getGovernance() {
    return this.dashboardsService.getGovernanceMetrics();
  }

  @Get('trends')
  @ApiOperation({ summary: 'Trend data over time' })
  getTrends() {
    return this.dashboardsService.getTrendMetrics();
  }
}
