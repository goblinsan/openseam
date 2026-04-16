import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  assessment: { findUnique: jest.fn() },
  advisoryReport: {
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
  },
};

const fullAssessment = {
  id: 'a1',
  name: 'Test Assessment',
  organizationName: 'Acme Corp',
  projectName: 'Cloud Migration',
  status: 'in_review',
  intake: {
    applicationName: 'My App',
    cloudProviders: ['aws'],
    environments: ['prod', 'staging'],
    portabilityGoals: 'Multi-cloud portability',
  },
  inventory: {
    providerSummaries: [{ provider: 'aws', serviceCount: 3, proprietaryServices: 1, portabilityRiskLevel: 'high' }],
    services: [
      { name: 'S3', provider: 'aws', category: 'Object Storage', type: 'portable' },
      { name: 'DynamoDB', provider: 'aws', category: 'NoSQL Database', type: 'proprietary' },
    ],
    lockInRisks: [
      { service: 'DynamoDB', provider: 'aws', severity: 'high', description: 'Proprietary API' },
    ],
  },
  portabilityScore: {
    overallScore: 55.0,
    rating: 'fair',
    modelVersion: 'v1',
    dimensions: [{ name: 'Service Portability', weight: 0.2, rawScore: 50, weightedScore: 10 }],
    deductions: [],
  },
  recommendations: [
    { title: 'Replace DynamoDB', description: 'Use portable DB', priority: 'high', impact: 'high', effort: 'high', rationale: 'Proprietary API', implementationGuidance: 'Use PostgreSQL', relatedServices: ['DynamoDB'] },
  ],
};

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ReportsService>(ReportsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('generate() throws if assessment not found', async () => {
    mockPrisma.assessment.findUnique.mockResolvedValue(null);
    await expect(service.generate('nonexistent')).rejects.toThrow('Assessment nonexistent not found');
  });

  it('generate() creates markdown report with correct metadata', async () => {
    mockPrisma.assessment.findUnique.mockResolvedValue(fullAssessment);
    mockPrisma.advisoryReport.create.mockResolvedValue({ id: 'rep-1' });

    await service.generate('a1');

    const createArg = mockPrisma.advisoryReport.create.mock.calls[0][0];
    expect(createArg.data.format).toBe('markdown');
    expect(createArg.data.organizationName).toBe('Acme Corp');
    expect(createArg.data.content).toContain('OpenSeam Portability Assessment Report');
    expect(createArg.data.content).toContain('DynamoDB');
    expect(createArg.data.metadata.riskCount).toBe(1);
    expect(createArg.data.metadata.recommendationCount).toBe(1);
  });

  it('generate() includes scoring dimensions in report content', async () => {
    mockPrisma.assessment.findUnique.mockResolvedValue(fullAssessment);
    mockPrisma.advisoryReport.create.mockResolvedValue({ id: 'rep-2' });

    await service.generate('a1');

    const createArg = mockPrisma.advisoryReport.create.mock.calls[0][0];
    expect(createArg.data.content).toContain('Portability Scorecard');
    expect(createArg.data.content).toContain('55.0/100');
  });
});
