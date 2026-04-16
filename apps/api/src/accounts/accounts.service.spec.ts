import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from './accounts.service';
import { PrismaService } from '../prisma/prisma.service';

const mockAccount = {
  id: 'acc-1',
  name: 'Acme Corp',
  industry: 'Tech',
  website: 'https://acme.com',
  description: 'A test company',
  isDesignPartner: false,
  tags: ['enterprise'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  account: {
    create: jest.fn().mockResolvedValue(mockAccount),
    findMany: jest.fn().mockResolvedValue([mockAccount]),
    findUnique: jest.fn().mockResolvedValue({ ...mockAccount, contacts: [], opportunities: [], interviews: [] }),
    update: jest.fn().mockResolvedValue(mockAccount),
    delete: jest.fn().mockResolvedValue(mockAccount),
  },
};

describe('AccountsService', () => {
  let service: AccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() calls prisma.account.create with dto', async () => {
    mockPrisma.account.create.mockResolvedValue(mockAccount);
    const dto = { name: 'Acme Corp', isDesignPartner: false, tags: [] };
    const result = await service.create(dto as any);
    expect(mockPrisma.account.create).toHaveBeenCalledWith({ data: dto });
    expect(result.name).toBe('Acme Corp');
  });

  it('findAll() returns all accounts', async () => {
    mockPrisma.account.findMany.mockResolvedValue([mockAccount]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Acme Corp');
  });

  it('findAll() filters by isDesignPartner', async () => {
    mockPrisma.account.findMany.mockResolvedValue([]);
    await service.findAll({ isDesignPartner: true });
    expect(mockPrisma.account.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isDesignPartner: true } }),
    );
  });

  it('findAll() adds search filter when search provided', async () => {
    mockPrisma.account.findMany.mockResolvedValue([mockAccount]);
    await service.findAll({ search: 'Acme' });
    const callArg = mockPrisma.account.findMany.mock.calls[0][0];
    expect(callArg.where.OR).toBeDefined();
  });

  it('findOne() returns account with relations', async () => {
    const full = { ...mockAccount, contacts: [], opportunities: [], interviews: [] };
    mockPrisma.account.findUnique.mockResolvedValue(full);
    const result = await service.findOne('acc-1');
    expect(mockPrisma.account.findUnique).toHaveBeenCalledWith({
      where: { id: 'acc-1' },
      include: { contacts: true, opportunities: true, interviews: true },
    });
    expect(result).toEqual(full);
  });

  it('update() calls prisma.account.update', async () => {
    mockPrisma.account.update.mockResolvedValue({ ...mockAccount, name: 'Updated' });
    const result = await service.update('acc-1', { name: 'Updated' } as any);
    expect(result.name).toBe('Updated');
  });

  it('remove() calls prisma.account.delete', async () => {
    mockPrisma.account.delete.mockResolvedValue(mockAccount);
    await service.remove('acc-1');
    expect(mockPrisma.account.delete).toHaveBeenCalledWith({ where: { id: 'acc-1' } });
  });
});
