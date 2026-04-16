import { Test, TestingModule } from '@nestjs/testing';
import { PortabilityScoringService } from './portability-scoring.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  portabilityInventory: {
    findUnique: jest.fn(),
  },
  portabilityScore: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const portableInventory = {
  id: 'inv-1',
  assessmentId: 'a1',
  services: [
    { id: 's1', name: 'S3', provider: 'aws', category: 'Object Storage', type: 'portable', equivalents: [] },
    { id: 's2', name: 'EKS', provider: 'aws', category: 'Managed Kubernetes', type: 'portable', equivalents: [] },
    { id: 's3', name: 'Terraform', provider: 'multi', category: 'Infrastructure as Code', type: 'portable', equivalents: [] },
  ],
  lockInRisks: [],
};

const proprietaryInventory = {
  id: 'inv-2',
  assessmentId: 'a2',
  services: [
    { id: 's4', name: 'DynamoDB', provider: 'aws', category: 'NoSQL Database', type: 'proprietary', equivalents: [] },
    { id: 's5', name: 'AWS Lambda', provider: 'aws', category: 'Serverless Compute', type: 'cloud_native', equivalents: [] },
  ],
  lockInRisks: [
    { id: 'r1', service: 'DynamoDB', provider: 'aws', severity: 'high', description: 'Proprietary API' },
    { id: 'r2', service: 'AWS Lambda', provider: 'aws', severity: 'medium', description: 'Cloud native' },
  ],
};

describe('PortabilityScoringService', () => {
  let service: PortabilityScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortabilityScoringService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<PortabilityScoringService>(PortabilityScoringService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('calculate() throws if no inventory found', async () => {
    mockPrisma.portabilityInventory.findUnique.mockResolvedValue(null);
    await expect(service.calculate('a-missing')).rejects.toThrow('No inventory found for assessment a-missing');
  });

  it('calculate() produces excellent rating for all-portable services', async () => {
    mockPrisma.portabilityInventory.findUnique.mockResolvedValue(portableInventory);
    mockPrisma.portabilityScore.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'ps-1', ...data }),
    );

    await service.calculate('a1');

    const createArg = mockPrisma.portabilityScore.create.mock.calls[0][0];
    expect(createArg.data.rating).toBe('excellent');
    expect(createArg.data.overallScore).toBeGreaterThanOrEqual(75);
  });

  it('calculate() produces lower rating for proprietary services with high risks', async () => {
    mockPrisma.portabilityInventory.findUnique.mockResolvedValue(proprietaryInventory);
    mockPrisma.portabilityScore.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'ps-2', ...data }),
    );

    await service.calculate('a2');

    const createArg = mockPrisma.portabilityScore.create.mock.calls[0][0];
    // Score should be lower due to proprietary services and deductions
    expect(createArg.data.overallScore).toBeLessThan(75);
  });

  it('calculate() updates existing score instead of creating new', async () => {
    mockPrisma.portabilityInventory.findUnique.mockResolvedValue(portableInventory);
    mockPrisma.portabilityScore.findUnique.mockResolvedValue({ id: 'ps-existing', assessmentId: 'a1' });
    mockPrisma.portabilityScore.update.mockResolvedValue({ id: 'ps-existing' });

    await service.calculate('a1');

    expect(mockPrisma.portabilityScore.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.portabilityScore.create).not.toHaveBeenCalled();
  });

  it('calculate() includes all 10 scoring dimensions', async () => {
    mockPrisma.portabilityInventory.findUnique.mockResolvedValue(portableInventory);
    mockPrisma.portabilityScore.findUnique.mockResolvedValue(null);
    mockPrisma.portabilityScore.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'ps-3', ...data }),
    );

    await service.calculate('a1');

    const createArg = mockPrisma.portabilityScore.create.mock.calls[0][0];
    expect(createArg.data.dimensions).toHaveLength(10);
  });
});
