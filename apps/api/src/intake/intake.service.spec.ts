import { Test, TestingModule } from '@nestjs/testing';
import { IntakeService } from './intake.service';
import { PrismaService } from '../prisma/prisma.service';

const mockIntake = {
  id: 'intake-1',
  accountId: null,
  organizationName: 'Acme Corp',
  applicationName: 'CloudApp',
  description: 'Main SaaS platform',
  primaryContact: 'alice@acme.com',
  cloudProviders: ['aws', 'gcp'],
  environments: ['dev', 'staging', 'prod'],
  compute: { services: ['EC2', 'GKE'], orchestration: 'Kubernetes' },
  storage: { databases: ['RDS'], objectStorage: ['S3'] },
  messaging: { queues: ['SQS'] },
  identity: { providers: ['Okta'] },
  networking: {},
  cicd: { tools: ['GitHub Actions'] },
  observability: { logging: ['CloudWatch'], monitoring: ['Datadog'] },
  security: { tools: ['Wiz'] },
  compliance: ['SOC2', 'ISO27001'],
  dataResidency: 'US',
  disasterRecovery: 'Multi-region failover',
  integrations: [],
  portabilityGoals: 'Reduce AWS lock-in by 50%',
  status: 'draft',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  architectureIntake: {
    create: jest.fn().mockResolvedValue(mockIntake),
    findMany: jest.fn().mockResolvedValue([mockIntake]),
    findUnique: jest.fn().mockResolvedValue({ ...mockIntake, account: null }),
    update: jest.fn().mockResolvedValue(mockIntake),
    delete: jest.fn().mockResolvedValue(mockIntake),
  },
};

describe('IntakeService', () => {
  let service: IntakeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntakeService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<IntakeService>(IntakeService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() creates an intake record in draft status', async () => {
    mockPrisma.architectureIntake.create.mockResolvedValue(mockIntake);
    const dto = {
      organizationName: 'Acme Corp',
      applicationName: 'CloudApp',
      primaryContact: 'alice@acme.com',
      cloudProviders: ['aws', 'gcp'],
      environments: ['dev', 'prod'],
      compute: { services: ['EC2'] },
      storage: { databases: ['RDS'], objectStorage: ['S3'] },
      messaging: {},
      identity: { providers: ['Okta'] },
      networking: {},
      cicd: { tools: ['GitHub Actions'] },
      observability: {},
      security: {},
      compliance: ['SOC2'],
    };
    const result = await service.create(dto as any);
    expect(result.organizationName).toBe('Acme Corp');
    expect(result.cloudProviders).toContain('aws');
    expect(result.status).toBe('draft');
  });

  it('findAll() lists all intakes with account relation', async () => {
    mockPrisma.architectureIntake.findMany.mockResolvedValue([mockIntake]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
    expect(mockPrisma.architectureIntake.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({ account: expect.anything() }),
      }),
    );
  });

  it('submit() updates status to submitted', async () => {
    mockPrisma.architectureIntake.update.mockResolvedValue({ ...mockIntake, status: 'submitted' });
    const result = await service.submit('intake-1');
    expect(mockPrisma.architectureIntake.update).toHaveBeenCalledWith({
      where: { id: 'intake-1' },
      data: { status: 'submitted' },
    });
    expect(result.status).toBe('submitted');
  });

  it('remove() deletes an intake', async () => {
    await service.remove('intake-1');
    expect(mockPrisma.architectureIntake.delete).toHaveBeenCalledWith({ where: { id: 'intake-1' } });
  });
});
