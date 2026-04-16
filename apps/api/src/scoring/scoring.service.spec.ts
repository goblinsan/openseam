import { Test, TestingModule } from '@nestjs/testing';
import { ScoringService } from './scoring.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  scoringConfig: {
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    update: jest.fn(),
  },
  opportunityScore: {
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
  },
};

describe('ScoringService', () => {
  let service: ScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoringService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ScoringService>(ScoringService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('calculate() stores score using default weights when no config', async () => {
    mockPrisma.scoringConfig.findFirst.mockResolvedValue(null);
    mockPrisma.opportunityScore.create.mockResolvedValue({
      id: 'score-1',
      accountId: 'acc-1',
      totalScore: 50,
      rating: 'medium',
      breakdown: [],
      calculatedAt: new Date(),
    });

    await service.calculate({
      accountId: 'acc-1',
      strategicFit: 50,
      cloudComplexity: 50,
      vendorLockInRisk: 50,
      technicalMaturity: 50,
      revenuePotential: 50,
      urgency: 50,
      regulatoryPressure: 50,
      innovationReadiness: 50,
      designPartnerPotential: 50,
      referenceValue: 50,
    });

    expect(mockPrisma.opportunityScore.create).toHaveBeenCalledTimes(1);
    const callArg = mockPrisma.opportunityScore.create.mock.calls[0][0];
    expect(callArg.data.totalScore).toBeCloseTo(50, 0);
    expect(callArg.data.rating).toBe('medium');
  });

  it('rates score >= 80 as strategic', async () => {
    mockPrisma.scoringConfig.findFirst.mockResolvedValue(null);
    mockPrisma.opportunityScore.create.mockImplementation(({ data }) =>
      Promise.resolve({ ...data, id: 'score-2', calculatedAt: new Date() }),
    );

    await service.calculate({
      accountId: 'acc-2',
      strategicFit: 100,
      cloudComplexity: 100,
      vendorLockInRisk: 100,
      technicalMaturity: 100,
      revenuePotential: 100,
      urgency: 100,
      regulatoryPressure: 100,
      innovationReadiness: 100,
      designPartnerPotential: 100,
      referenceValue: 100,
    });

    const callArg = mockPrisma.opportunityScore.create.mock.calls[0][0];
    expect(callArg.data.rating).toBe('strategic');
    expect(callArg.data.totalScore).toBeCloseTo(100, 0);
  });

  it('rates score < 40 as low', async () => {
    mockPrisma.scoringConfig.findFirst.mockResolvedValue(null);
    mockPrisma.opportunityScore.create.mockImplementation(({ data }) =>
      Promise.resolve({ ...data, id: 'score-3', calculatedAt: new Date() }),
    );

    await service.calculate({
      accountId: 'acc-3',
      strategicFit: 0,
      cloudComplexity: 0,
      vendorLockInRisk: 0,
      technicalMaturity: 0,
      revenuePotential: 0,
      urgency: 0,
      regulatoryPressure: 0,
      innovationReadiness: 0,
      designPartnerPotential: 0,
      referenceValue: 0,
    });

    const callArg = mockPrisma.opportunityScore.create.mock.calls[0][0];
    expect(callArg.data.rating).toBe('low');
    expect(callArg.data.totalScore).toBeCloseTo(0, 0);
  });

  it('uses custom weights from DB config', async () => {
    mockPrisma.scoringConfig.findFirst.mockResolvedValue({
      id: 'cfg-1',
      strategicFit: 1.0,
      cloudComplexity: 0,
      vendorLockInRisk: 0,
      technicalMaturity: 0,
      revenuePotential: 0,
      urgency: 0,
      regulatoryPressure: 0,
      innovationReadiness: 0,
      designPartnerPotential: 0,
      referenceValue: 0,
    });
    mockPrisma.opportunityScore.create.mockImplementation(({ data }) =>
      Promise.resolve({ ...data, id: 'score-4', calculatedAt: new Date() }),
    );

    await service.calculate({ accountId: 'acc-4', strategicFit: 80 });

    const callArg = mockPrisma.opportunityScore.create.mock.calls[0][0];
    expect(callArg.data.totalScore).toBeCloseTo(80, 0);
  });

  it('getRankings() returns scores ordered by totalScore desc', async () => {
    await service.getRankings();
    expect(mockPrisma.opportunityScore.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { totalScore: 'desc' } }),
    );
  });

  it('updateWeights() creates config if none exists', async () => {
    mockPrisma.scoringConfig.findFirst.mockResolvedValue(null);
    mockPrisma.scoringConfig.create.mockResolvedValue({ id: 'cfg-new' });

    await service.updateWeights({ strategicFit: 0.3 });

    expect(mockPrisma.scoringConfig.create).toHaveBeenCalledTimes(1);
  });

  it('updateWeights() updates existing config', async () => {
    mockPrisma.scoringConfig.findFirst.mockResolvedValue({ id: 'cfg-existing', updatedAt: new Date() });
    mockPrisma.scoringConfig.update.mockResolvedValue({ id: 'cfg-existing' });

    await service.updateWeights({ strategicFit: 0.25 });

    expect(mockPrisma.scoringConfig.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.scoringConfig.update.mock.calls[0][0].where).toEqual({ id: 'cfg-existing' });
  });
});
