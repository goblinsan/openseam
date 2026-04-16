import { Test, TestingModule } from '@nestjs/testing';
import { MigrationsService } from './migrations.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  migrationScenario: {
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    update: jest.fn(),
  },
  migrationReport: {
    create: jest.fn(),
    findUnique: jest.fn().mockResolvedValue(null),
  },
};

describe('MigrationsService', () => {
  let service: MigrationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MigrationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<MigrationsService>(MigrationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('createScenario() calls prisma.migrationScenario.create', async () => {
    const dto = { projectId: 'p1', sourceProvider: 'aws', targetProvider: 'gcp' };
    mockPrisma.migrationScenario.create.mockResolvedValue({ id: 'ms1', ...dto });
    await service.createScenario(dto);
    expect(mockPrisma.migrationScenario.create).toHaveBeenCalledWith({ data: dto });
  });

  it('listScenarios() returns scenarios', async () => {
    mockPrisma.migrationScenario.findMany.mockResolvedValue([{ id: 'ms1' }]);
    const result = await service.listScenarios();
    expect(result).toHaveLength(1);
  });

  it('listScenarios() filters by projectId', async () => {
    mockPrisma.migrationScenario.findMany.mockResolvedValue([]);
    await service.listScenarios('p1');
    expect(mockPrisma.migrationScenario.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { projectId: 'p1' } }),
    );
  });

  it('simulate() generates a migration report', async () => {
    const scenario = { id: 'ms1', projectId: 'p1', sourceProvider: 'aws', targetProvider: 'gcp', status: 'pending' };
    mockPrisma.migrationScenario.findUnique.mockResolvedValue(scenario);
    mockPrisma.migrationScenario.update.mockResolvedValue({ ...scenario, status: 'analyzing' });
    mockPrisma.migrationReport.create.mockResolvedValue({ id: 'mr1', scenarioId: 'ms1' });

    await service.simulate('ms1');

    expect(mockPrisma.migrationReport.create).toHaveBeenCalled();
    expect(mockPrisma.migrationScenario.update).toHaveBeenCalledTimes(2);
  });

  it('simulate() throws when scenario not found', async () => {
    mockPrisma.migrationScenario.findUnique.mockResolvedValue(null);
    await expect(service.simulate('missing')).rejects.toThrow('Scenario missing not found');
  });
});
