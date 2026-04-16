import { Test, TestingModule } from '@nestjs/testing';
import { PatternsService } from './patterns.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  pattern: {
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('PatternsService', () => {
  let service: PatternsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatternsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<PatternsService>(PatternsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() calls prisma.pattern.create', async () => {
    const dto = { name: 'API Service', category: 'compute', description: 'Stateless REST service' };
    mockPrisma.pattern.create.mockResolvedValue({ id: 'p1', ...dto, portability: 'high', version: '1.0.0' });
    await service.create(dto);
    expect(mockPrisma.pattern.create).toHaveBeenCalledWith({ data: dto });
  });

  it('findAll() returns patterns without filter', async () => {
    mockPrisma.pattern.findMany.mockResolvedValue([{ id: 'p1' }]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
    expect(mockPrisma.pattern.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    );
  });

  it('findAll() filters by category', async () => {
    mockPrisma.pattern.findMany.mockResolvedValue([]);
    await service.findAll('compute');
    expect(mockPrisma.pattern.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { category: 'compute' } }),
    );
  });

  it('findCategories() returns unique categories', async () => {
    mockPrisma.pattern.findMany.mockResolvedValue([
      { category: 'compute' },
      { category: 'storage' },
    ]);
    const result = await service.findCategories();
    expect(result).toEqual(['compute', 'storage']);
  });

  it('remove() calls prisma.pattern.delete', async () => {
    mockPrisma.pattern.delete.mockResolvedValue({ id: 'p1' });
    await service.remove('p1');
    expect(mockPrisma.pattern.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
  });
});
