import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentsService } from './assessments.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  assessment: {
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('AssessmentsService', () => {
  let service: AssessmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<AssessmentsService>(AssessmentsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() calls prisma.assessment.create', async () => {
    const dto = { name: 'Test', organizationName: 'Acme', projectName: 'Project X' };
    mockPrisma.assessment.create.mockResolvedValue({ id: 'a1', ...dto, status: 'draft' });
    await service.create(dto);
    expect(mockPrisma.assessment.create).toHaveBeenCalledWith({ data: dto });
  });

  it('findAll() returns list', async () => {
    mockPrisma.assessment.findMany.mockResolvedValue([{ id: 'a1' }]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('remove() calls prisma.assessment.delete', async () => {
    mockPrisma.assessment.delete.mockResolvedValue({ id: 'a1' });
    await service.remove('a1');
    expect(mockPrisma.assessment.delete).toHaveBeenCalledWith({ where: { id: 'a1' } });
  });
});
