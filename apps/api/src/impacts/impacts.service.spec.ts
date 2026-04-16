import { Test, TestingModule } from '@nestjs/testing';
import { ImpactsService } from './impacts.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  changeImpactReport: {
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
  },
};

describe('ImpactsService', () => {
  let service: ImpactsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImpactsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ImpactsService>(ImpactsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('analyze() creates an impact report', async () => {
    const dto = { projectId: 'p1', artifactType: 'manifest', after: { providers: { aws: {} } } };
    mockPrisma.changeImpactReport.create.mockResolvedValue({ id: 'r1', ...dto });
    await service.analyze(dto);
    expect(mockPrisma.changeImpactReport.create).toHaveBeenCalled();
  });

  it('analyze() detects proprietary service risk', async () => {
    const dto = { projectId: 'p1', artifactType: 'manifest', after: { proprietary: true } };
    mockPrisma.changeImpactReport.create.mockResolvedValue({ id: 'r1' });
    await service.analyze(dto);
    const callArg = mockPrisma.changeImpactReport.create.mock.calls[0][0];
    const risks = callArg.data.risks as Array<{ severity: string }>;
    expect(risks.some((r) => r.severity === 'high')).toBe(true);
  });

  it('listReports() returns reports', async () => {
    mockPrisma.changeImpactReport.findMany.mockResolvedValue([{ id: 'r1' }]);
    const result = await service.listReports();
    expect(result).toHaveLength(1);
  });

  it('listReports() filters by projectId', async () => {
    mockPrisma.changeImpactReport.findMany.mockResolvedValue([]);
    await service.listReports('p1');
    expect(mockPrisma.changeImpactReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { projectId: 'p1' } }),
    );
  });

  it('getReport() calls findUnique', async () => {
    mockPrisma.changeImpactReport.findUnique.mockResolvedValue({ id: 'r1' });
    await service.getReport('r1');
    expect(mockPrisma.changeImpactReport.findUnique).toHaveBeenCalledWith({ where: { id: 'r1' } });
  });
});
