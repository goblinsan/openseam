import { Test, TestingModule } from '@nestjs/testing';
import { EvidenceService } from './evidence.service';
import { PrismaService } from '../prisma/prisma.service';

const mockEvidence = {
  id: 'ev-1',
  title: 'Customer needs portability',
  description: 'Customer expressed strong need for multi-cloud portability',
  category: 'customer_interview',
  sourceType: 'interview',
  sourceReference: null,
  tags: ['portability', 'cloud'],
  accountId: 'acc-1',
  opportunityId: null,
  interviewId: null,
  hypothesisId: null,
  confidence: 'high',
  impact: 'high',
  createdBy: 'alice',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  evidence: {
    create: jest.fn().mockResolvedValue(mockEvidence),
    findMany: jest.fn().mockResolvedValue([mockEvidence]),
    findUnique: jest.fn().mockResolvedValue(mockEvidence),
    update: jest.fn().mockResolvedValue(mockEvidence),
    delete: jest.fn().mockResolvedValue(mockEvidence),
  },
};

describe('EvidenceService', () => {
  let service: EvidenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvidenceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EvidenceService>(EvidenceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() creates evidence record', async () => {
    mockPrisma.evidence.create.mockResolvedValue(mockEvidence);
    const dto = {
      title: 'Customer needs portability',
      description: 'desc',
      category: 'customer_interview',
      sourceType: 'interview',
      createdBy: 'alice',
      confidence: 'high',
      impact: 'high',
      tags: [],
    };
    const result = await service.create(dto as any);
    expect(result.title).toBe('Customer needs portability');
    expect(mockPrisma.evidence.create).toHaveBeenCalledTimes(1);
  });

  it('findAll() returns all evidence', async () => {
    mockPrisma.evidence.findMany.mockResolvedValue([mockEvidence]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('findAll() filters by category', async () => {
    mockPrisma.evidence.findMany.mockResolvedValue([mockEvidence]);
    await service.findAll({ category: 'customer_interview' });
    const callArg = mockPrisma.evidence.findMany.mock.calls[0][0];
    expect(callArg.where.category).toBe('customer_interview');
  });

  it('findAll() adds full-text search on title and description', async () => {
    mockPrisma.evidence.findMany.mockResolvedValue([mockEvidence]);
    await service.findAll({ search: 'portability' });
    const callArg = mockPrisma.evidence.findMany.mock.calls[0][0];
    expect(callArg.where.OR).toBeDefined();
    expect(callArg.where.OR[0].title.contains).toBe('portability');
  });

  it('findOne() retrieves evidence by id', async () => {
    mockPrisma.evidence.findUnique.mockResolvedValue(mockEvidence);
    const result = await service.findOne('ev-1');
    expect(mockPrisma.evidence.findUnique).toHaveBeenCalledWith({ where: { id: 'ev-1' } });
    expect(result?.id).toBe('ev-1');
  });

  it('remove() deletes evidence', async () => {
    await service.remove('ev-1');
    expect(mockPrisma.evidence.delete).toHaveBeenCalledWith({ where: { id: 'ev-1' } });
  });
});
