import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesService } from './workspaces.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  workspace: {
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('WorkspacesService', () => {
  let service: WorkspacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<WorkspacesService>(WorkspacesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() calls prisma.workspace.create', async () => {
    const dto = { name: 'Acme', slug: 'acme' };
    mockPrisma.workspace.create.mockResolvedValue({ id: 'w1', ...dto });
    await service.create(dto);
    expect(mockPrisma.workspace.create).toHaveBeenCalledWith({ data: dto });
  });

  it('findAll() returns list', async () => {
    mockPrisma.workspace.findMany.mockResolvedValue([{ id: 'w1' }]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('remove() calls prisma.workspace.delete', async () => {
    mockPrisma.workspace.delete.mockResolvedValue({ id: 'w1' });
    await service.remove('w1');
    expect(mockPrisma.workspace.delete).toHaveBeenCalledWith({ where: { id: 'w1' } });
  });
});
