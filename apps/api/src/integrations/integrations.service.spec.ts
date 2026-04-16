import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationsService } from './integrations.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  pipelineIntegration: {
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    delete: jest.fn(),
  },
  pipelineRun: {
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    update: jest.fn(),
  },
  pullRequestCheck: {
    findMany: jest.fn().mockResolvedValue([]),
  },
};

describe('IntegrationsService', () => {
  let service: IntegrationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<IntegrationsService>(IntegrationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('createIntegration() calls prisma.pipelineIntegration.create', async () => {
    const dto = { projectId: 'p1', repositoryUrl: 'https://github.com/org/repo' };
    mockPrisma.pipelineIntegration.create.mockResolvedValue({ id: 'int1', ...dto });
    await service.createIntegration(dto);
    expect(mockPrisma.pipelineIntegration.create).toHaveBeenCalledWith({ data: dto });
  });

  it('listIntegrations() returns integrations', async () => {
    mockPrisma.pipelineIntegration.findMany.mockResolvedValue([{ id: 'int1' }]);
    const result = await service.listIntegrations();
    expect(result).toHaveLength(1);
  });

  it('listIntegrations() filters by projectId', async () => {
    mockPrisma.pipelineIntegration.findMany.mockResolvedValue([]);
    await service.listIntegrations('p1');
    expect(mockPrisma.pipelineIntegration.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { projectId: 'p1' } }),
    );
  });

  it('deleteIntegration() calls prisma.pipelineIntegration.delete', async () => {
    mockPrisma.pipelineIntegration.delete.mockResolvedValue({ id: 'int1' });
    await service.deleteIntegration('int1');
    expect(mockPrisma.pipelineIntegration.delete).toHaveBeenCalledWith({ where: { id: 'int1' } });
  });

  it('createPipelineRun() calls prisma.pipelineRun.create', async () => {
    const dto = { integrationId: 'int1', commitSha: 'abc123' };
    mockPrisma.pipelineRun.create.mockResolvedValue({ id: 'run1', ...dto });
    await service.createPipelineRun(dto);
    expect(mockPrisma.pipelineRun.create).toHaveBeenCalledWith({ data: dto });
  });

  it('listPipelineRuns() returns runs', async () => {
    mockPrisma.pipelineRun.findMany.mockResolvedValue([{ id: 'run1' }]);
    const result = await service.listPipelineRuns('int1');
    expect(result).toHaveLength(1);
  });

  it('updatePipelineRunStatus() updates status', async () => {
    mockPrisma.pipelineRun.update.mockResolvedValue({ id: 'run1', status: 'success' });
    await service.updatePipelineRunStatus('run1', 'success');
    expect(mockPrisma.pipelineRun.update).toHaveBeenCalledWith({
      where: { id: 'run1' },
      data: { status: 'success' },
    });
  });
});
