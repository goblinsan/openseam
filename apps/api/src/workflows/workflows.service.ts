import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateApprovalDto } from './dto/create-approval.dto';

@Injectable()
export class WorkflowsService {
  constructor(private prisma: PrismaService) {}

  createWorkflow(dto: CreateWorkflowDto) {
    return this.prisma.workflow.create({ data: dto });
  }

  listWorkflows(projectId?: string) {
    return this.prisma.workflow.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        _count: { select: { tasks: true, approvals: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  getWorkflow(id: string) {
    return this.prisma.workflow.findUnique({
      where: { id },
      include: { tasks: true, approvals: true, reviews: true },
    });
  }

  updateWorkflowStatus(id: string, status: string) {
    return this.prisma.workflow.update({ where: { id }, data: { status } });
  }

  deleteWorkflow(id: string) {
    return this.prisma.workflow.delete({ where: { id } });
  }

  createTask(dto: CreateTaskDto) {
    return this.prisma.workflowTask.create({ data: dto });
  }

  getTask(id: string) {
    return this.prisma.workflowTask.findUnique({ where: { id } });
  }

  updateTaskStatus(id: string, status: string) {
    return this.prisma.workflowTask.update({ where: { id }, data: { status } });
  }

  createApproval(dto: CreateApprovalDto) {
    return this.prisma.workflowApproval.create({ data: dto });
  }

  submitReview(workflowId: string, reviewerId: string, comments: string, status: string) {
    return this.prisma.workflowReview.create({
      data: { workflowId, reviewerId, comments, status },
    });
  }

  listNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  listActivityLogs() {
    return this.prisma.activityLog.findMany({ orderBy: { timestamp: 'desc' }, take: 100 });
  }

  logActivity(entityType: string, entityId: string, action: string, performedBy: string) {
    return this.prisma.activityLog.create({
      data: { entityType, entityId, action, performedBy },
    });
  }
}
