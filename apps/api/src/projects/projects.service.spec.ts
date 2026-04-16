import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  project: {
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ProjectsService>(ProjectsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() calls prisma.project.create', async () => {
    const dto = { workspaceId: 'w1', name: 'Invoice Service' };
    mockPrisma.project.create.mockResolvedValue({ id: 'proj1', ...dto });
    await service.create(dto);
    expect(mockPrisma.project.create).toHaveBeenCalledWith({ data: dto });
  });

  it('findAll() returns projects', async () => {
    mockPrisma.project.findMany.mockResolvedValue([{ id: 'proj1' }]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('findAll() filters by workspaceId', async () => {
    mockPrisma.project.findMany.mockResolvedValue([]);
    await service.findAll('w1');
    expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { workspaceId: 'w1' } }),
    );
  });

  it('remove() calls prisma.project.delete', async () => {
    mockPrisma.project.delete.mockResolvedValue({ id: 'proj1' });
    await service.remove('proj1');
    expect(mockPrisma.project.delete).toHaveBeenCalledWith({ where: { id: 'proj1' } });
  });
});
