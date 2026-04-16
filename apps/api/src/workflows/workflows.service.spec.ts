import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowsService } from './workflows.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  workflow: {
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    update: jest.fn(),
    delete: jest.fn(),
  },
  workflowTask: {
    create: jest.fn(),
    findUnique: jest.fn().mockResolvedValue(null),
    update: jest.fn(),
  },
  workflowApproval: {
    create: jest.fn(),
  },
  workflowReview: {
    create: jest.fn(),
  },
  notification: {
    findMany: jest.fn().mockResolvedValue([]),
  },
  activityLog: {
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
  },
};

describe('WorkflowsService', () => {
  let service: WorkflowsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<WorkflowsService>(WorkflowsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('createWorkflow() calls prisma.workflow.create', async () => {
    const dto = { projectId: 'p1', name: 'Architecture Review' };
    mockPrisma.workflow.create.mockResolvedValue({ id: 'wf1', ...dto });
    await service.createWorkflow(dto);
    expect(mockPrisma.workflow.create).toHaveBeenCalledWith({ data: dto });
  });

  it('listWorkflows() returns workflows', async () => {
    mockPrisma.workflow.findMany.mockResolvedValue([{ id: 'wf1' }]);
    const result = await service.listWorkflows();
    expect(result).toHaveLength(1);
  });

  it('listWorkflows() filters by projectId', async () => {
    mockPrisma.workflow.findMany.mockResolvedValue([]);
    await service.listWorkflows('p1');
    expect(mockPrisma.workflow.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { projectId: 'p1' } }),
    );
  });

  it('updateWorkflowStatus() updates the workflow status', async () => {
    mockPrisma.workflow.update.mockResolvedValue({ id: 'wf1', status: 'approved' });
    await service.updateWorkflowStatus('wf1', 'approved');
    expect(mockPrisma.workflow.update).toHaveBeenCalledWith({
      where: { id: 'wf1' },
      data: { status: 'approved' },
    });
  });

  it('createTask() calls prisma.workflowTask.create', async () => {
    const dto = { workflowId: 'wf1', title: 'Review architecture' };
    mockPrisma.workflowTask.create.mockResolvedValue({ id: 't1', ...dto });
    await service.createTask(dto);
    expect(mockPrisma.workflowTask.create).toHaveBeenCalledWith({ data: dto });
  });

  it('createApproval() calls prisma.workflowApproval.create', async () => {
    const dto = { workflowId: 'wf1', approverId: 'user1' };
    mockPrisma.workflowApproval.create.mockResolvedValue({ id: 'a1', ...dto });
    await service.createApproval(dto);
    expect(mockPrisma.workflowApproval.create).toHaveBeenCalledWith({ data: dto });
  });

  it('logActivity() calls prisma.activityLog.create', async () => {
    mockPrisma.activityLog.create.mockResolvedValue({ id: 'log1' });
    await service.logActivity('workflow', 'wf1', 'created', 'user1');
    expect(mockPrisma.activityLog.create).toHaveBeenCalled();
  });
});
