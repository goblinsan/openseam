import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  assessment: {
    findUnique: jest.fn(),
  },
  portabilityInventory: {
    findUnique: jest.fn().mockResolvedValue(null),
    delete: jest.fn(),
    create: jest.fn(),
  },
};

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<InventoryService>(InventoryService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('generate() classifies known AWS services from intake', async () => {
    mockPrisma.assessment.findUnique.mockResolvedValue({
      id: 'a1',
      intake: {
        compute: { services: ['AWS Lambda', 'EKS'] },
        storage: { databases: ['DynamoDB'], objectStorage: ['S3'] },
        messaging: { queues: ['SQS'] },
        identity: { providers: ['AWS IAM'] },
        cicd: { tools: ['Terraform'] },
        observability: { monitoring: ['CloudWatch'] },
      },
    });

    mockPrisma.portabilityInventory.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'inv-1', assessmentId: data.assessmentId, services: [], lockInRisks: [] }),
    );

    await service.generate('a1');

    expect(mockPrisma.portabilityInventory.create).toHaveBeenCalledTimes(1);
    const createArg = mockPrisma.portabilityInventory.create.mock.calls[0][0];
    const services = createArg.data.services.create;
    const risks = createArg.data.lockInRisks.create;

    // Lambda should be classified as cloud_native
    const lambda = services.find((s: any) => s.name === 'AWS Lambda');
    expect(lambda).toBeDefined();
    expect(lambda.type).toBe('cloud_native');

    // DynamoDB should be classified as proprietary
    const dynamo = services.find((s: any) => s.name === 'DynamoDB');
    expect(dynamo).toBeDefined();
    expect(dynamo.type).toBe('proprietary');

    // EKS should be portable
    const eks = services.find((s: any) => s.name === 'EKS');
    expect(eks).toBeDefined();
    expect(eks.type).toBe('portable');

    // Should have lock-in risks for Lambda, DynamoDB, SQS, IAM
    expect(risks.length).toBeGreaterThan(0);
    const dynamoRisk = risks.find((r: any) => r.service === 'DynamoDB');
    expect(dynamoRisk.severity).toBe('high');
  });

  it('generate() throws error if assessment not found', async () => {
    mockPrisma.assessment.findUnique.mockResolvedValue(null);
    await expect(service.generate('nonexistent')).rejects.toThrow('Assessment nonexistent not found');
  });
});
