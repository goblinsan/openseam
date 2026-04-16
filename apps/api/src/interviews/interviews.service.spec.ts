import { Test, TestingModule } from '@nestjs/testing';
import { InterviewsService } from './interviews.service';
import { PrismaService } from '../prisma/prisma.service';

const mockTemplate = {
  id: 'tpl-1',
  name: 'Founder Interview',
  persona: 'CTO',
  description: 'Standard founder discovery interview',
  questions: ['What is your biggest cloud challenge?', 'Have you considered portability?'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockInterview = {
  id: 'int-1',
  accountId: 'acc-1',
  opportunityId: null,
  templateId: 'tpl-1',
  interviewer: 'alice',
  interviewee: 'bob',
  persona: 'CTO',
  status: 'scheduled',
  scheduledAt: new Date(),
  completedAt: null,
  notes: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  interviewTemplate: {
    create: jest.fn().mockResolvedValue(mockTemplate),
    findMany: jest.fn().mockResolvedValue([mockTemplate]),
    findUnique: jest.fn().mockResolvedValue(mockTemplate),
    update: jest.fn().mockResolvedValue(mockTemplate),
  },
  interview: {
    create: jest.fn().mockResolvedValue(mockInterview),
    findMany: jest.fn().mockResolvedValue([mockInterview]),
    findUnique: jest.fn().mockResolvedValue({ ...mockInterview, account: {}, evidence: [] }),
    update: jest.fn().mockResolvedValue(mockInterview),
  },
};

describe('InterviewsService', () => {
  let service: InterviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<InterviewsService>(InterviewsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('createTemplate() creates a reusable interview template', async () => {
    mockPrisma.interviewTemplate.create.mockResolvedValue(mockTemplate);
    const result = await service.createTemplate({
      name: 'Founder Interview',
      persona: 'CTO',
      questions: ['What is your biggest cloud challenge?'],
    } as any);
    expect(result.name).toBe('Founder Interview');
    expect(result.persona).toBe('CTO');
  });

  it('findAllTemplates() lists all templates', async () => {
    mockPrisma.interviewTemplate.findMany.mockResolvedValue([mockTemplate]);
    const result = await service.findAllTemplates();
    expect(result).toHaveLength(1);
    expect(result[0].questions).toHaveLength(2);
  });

  it('create() creates an interview linked to account', async () => {
    mockPrisma.interview.create.mockResolvedValue(mockInterview);
    const dto = {
      accountId: 'acc-1',
      interviewer: 'alice',
      interviewee: 'bob',
      persona: 'CTO',
      status: 'scheduled',
      scheduledAt: new Date().toISOString(),
      notes: '',
    };
    const result = await service.create(dto as any);
    expect(result.accountId).toBe('acc-1');
    expect(result.status).toBe('scheduled');
  });

  it('findAll() filters by accountId', async () => {
    mockPrisma.interview.findMany.mockResolvedValue([mockInterview]);
    await service.findAll({ accountId: 'acc-1' });
    const callArg = mockPrisma.interview.findMany.mock.calls[0][0];
    expect(callArg.where.accountId).toBe('acc-1');
  });

  it('findAll() filters by status', async () => {
    mockPrisma.interview.findMany.mockResolvedValue([mockInterview]);
    await service.findAll({ status: 'scheduled' });
    const callArg = mockPrisma.interview.findMany.mock.calls[0][0];
    expect(callArg.where.status).toBe('scheduled');
  });

  it('update() updates interview status', async () => {
    mockPrisma.interview.update.mockResolvedValue({ ...mockInterview, status: 'completed' });
    const result = await service.update('int-1', { status: 'completed' } as any);
    expect(result.status).toBe('completed');
  });
});
