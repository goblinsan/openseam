import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsService } from './recommendations.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  assessment: { findUnique: jest.fn() },
  recommendation: {
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    createMany: jest.fn().mockResolvedValue({ count: 0 }),
    findMany: jest.fn().mockResolvedValue([]),
  },
};

describe('RecommendationsService', () => {
  let service: RecommendationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<RecommendationsService>(RecommendationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('generate() throws if assessment not found', async () => {
    mockPrisma.assessment.findUnique.mockResolvedValue(null);
    await expect(service.generate('nonexistent')).rejects.toThrow('Assessment nonexistent not found');
  });

  it('generate() creates recommendations for DynamoDB lock-in', async () => {
    mockPrisma.assessment.findUnique.mockResolvedValue({
      id: 'a1',
      inventory: {
        services: [{ name: 'DynamoDB', type: 'proprietary', category: 'NoSQL Database' }],
        lockInRisks: [{ service: 'DynamoDB', provider: 'aws', severity: 'high', description: 'Proprietary API' }],
      },
      portabilityScore: { overallScore: 45, rating: 'fair' },
    });
    mockPrisma.recommendation.findMany.mockResolvedValue([{ id: 'r1', title: 'Replace DynamoDB with Portable Data Layer' }]);

    await service.generate('a1');

    const createManyArg = mockPrisma.recommendation.createMany.mock.calls[0][0];
    const titles = createManyArg.data.map((r: any) => r.title);
    expect(titles).toContain('Replace DynamoDB with Portable Data Layer');
  });

  it('generate() clears previous recommendations before regenerating', async () => {
    mockPrisma.assessment.findUnique.mockResolvedValue({
      id: 'a1',
      inventory: { services: [], lockInRisks: [] },
      portabilityScore: null,
    });

    await service.generate('a1');

    expect(mockPrisma.recommendation.deleteMany).toHaveBeenCalledWith({ where: { assessmentId: 'a1' } });
  });
});
