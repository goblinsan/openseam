import { Test, TestingModule } from '@nestjs/testing';
import { DashboardsService } from './dashboards.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  project: { findMany: jest.fn().mockResolvedValue([]) },
  assessment: { findMany: jest.fn().mockResolvedValue([]) },
  migrationScenario: { findMany: jest.fn().mockResolvedValue([]) },
  workflow: { findMany: jest.fn().mockResolvedValue([]) },
  changeImpactReport: { findMany: jest.fn().mockResolvedValue([]) },
  portabilityScore: { findMany: jest.fn().mockResolvedValue([]) },
};

describe('DashboardsService', () => {
  let service: DashboardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<DashboardsService>(DashboardsService);
    jest.clearAllMocks();
    Object.values(mockPrisma).forEach((m) => {
      if (m.findMany) m.findMany.mockResolvedValue([]);
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getExecutiveDashboard() returns summary metrics', async () => {
    mockPrisma.project.findMany.mockResolvedValue([{ id: 'p1', name: 'Test' }]);
    const result = await service.getExecutiveDashboard();
    expect(result.summary.totalProjects).toBe(1);
    expect(result.summary.averagePortabilityScore).toBe(0);
  });

  it('getExecutiveDashboard() calculates average portability score', async () => {
    mockPrisma.assessment.findMany.mockResolvedValue([
      { id: 'a1', projectName: 'App1', portabilityScore: { overallScore: 80, dimensions: [] } },
      { id: 'a2', projectName: 'App2', portabilityScore: { overallScore: 60, dimensions: [] } },
    ]);
    const result = await service.getExecutiveDashboard();
    expect(result.summary.averagePortabilityScore).toBe(70);
  });

  it('getRiskMetrics() groups reports by risk level', async () => {
    mockPrisma.changeImpactReport.findMany.mockResolvedValue([
      { summary: { overallRisk: 'high' } },
      { summary: { overallRisk: 'medium' } },
      { summary: { overallRisk: 'high' } },
    ]);
    const result = await service.getRiskMetrics();
    expect(result.high).toBe(2);
    expect(result.medium).toBe(1);
  });

  it('getGovernanceMetrics() calculates compliance score', async () => {
    mockPrisma.workflow.findMany.mockResolvedValue([
      { status: 'approved' },
      { status: 'approved' },
      { status: 'pending' },
    ]);
    const result = await service.getGovernanceMetrics();
    expect(result.complianceScore).toBe(67);
  });

  it('getTrendMetrics() returns portability trend data', async () => {
    const date = new Date('2025-01-01');
    mockPrisma.portabilityScore.findMany.mockResolvedValue([
      { calculatedAt: date, overallScore: 75 },
    ]);
    const result = await service.getTrendMetrics();
    expect(result).toHaveLength(1);
    expect(result[0].portabilityScore).toBe(75);
  });
});
