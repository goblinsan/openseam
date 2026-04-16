import { Test, TestingModule } from '@nestjs/testing';
import { HypothesesService } from './hypotheses.service';
import { PrismaService } from '../prisma/prisma.service';

const mockHypothesis = {
  id: 'hyp-1',
  statement: 'Enterprises with multi-cloud deployments will pay for portability tooling',
  status: 'unvalidated',
  evidence: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  hypothesis: {
    create: jest.fn().mockResolvedValue(mockHypothesis),
    findMany: jest.fn().mockResolvedValue([mockHypothesis]),
    findUnique: jest.fn().mockResolvedValue(mockHypothesis),
    update: jest.fn().mockResolvedValue(mockHypothesis),
  },
};

describe('HypothesesService', () => {
  let service: HypothesesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HypothesesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<HypothesesService>(HypothesesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() creates a hypothesis with unvalidated status', async () => {
    mockPrisma.hypothesis.create.mockResolvedValue(mockHypothesis);
    const dto = {
      statement: 'Enterprises with multi-cloud deployments will pay for portability tooling',
      status: 'unvalidated',
    };
    const result = await service.create(dto as any);
    expect(result.statement).toBe(mockHypothesis.statement);
    expect(result.status).toBe('unvalidated');
  });

  it('findAll() returns hypotheses with evidence', async () => {
    mockPrisma.hypothesis.findMany.mockResolvedValue([mockHypothesis]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
    expect(mockPrisma.hypothesis.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: { evidence: true } }),
    );
  });

  it('findAll() filters by status', async () => {
    mockPrisma.hypothesis.findMany.mockResolvedValue([mockHypothesis]);
    await service.findAll({ status: 'validated' });
    const callArg = mockPrisma.hypothesis.findMany.mock.calls[0][0];
    expect(callArg.where.status).toBe('validated');
  });

  it('update() can change status to validated', async () => {
    mockPrisma.hypothesis.update.mockResolvedValue({ ...mockHypothesis, status: 'validated' });
    const result = await service.update('hyp-1', { status: 'validated' } as any);
    expect(result.status).toBe('validated');
  });

  it('update() can link evidence ids to hypothesis', async () => {
    mockPrisma.hypothesis.update.mockResolvedValue({
      ...mockHypothesis,
      evidence: [{ id: 'ev-1', title: 'Test evidence' }],
    });
    await service.update('hyp-1', { evidenceIds: ['ev-1'] } as any);
    const callArg = mockPrisma.hypothesis.update.mock.calls[0][0];
    expect(callArg.data.evidence.set).toEqual([{ id: 'ev-1' }]);
  });
});
