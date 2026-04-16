import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { CreatePipelineRunDto } from './dto/create-pipeline-run.dto';

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  createIntegration(dto: CreateIntegrationDto) {
    return this.prisma.pipelineIntegration.create({ data: dto });
  }

  listIntegrations(projectId?: string) {
    return this.prisma.pipelineIntegration.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        _count: { select: { pipelineRuns: true, prChecks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  getIntegration(id: string) {
    return this.prisma.pipelineIntegration.findUnique({
      where: { id },
      include: { pipelineRuns: { orderBy: { createdAt: 'desc' }, take: 20 }, prChecks: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
  }

  deleteIntegration(id: string) {
    return this.prisma.pipelineIntegration.delete({ where: { id } });
  }

  createPipelineRun(dto: CreatePipelineRunDto) {
    return this.prisma.pipelineRun.create({ data: dto });
  }

  listPipelineRuns(integrationId: string) {
    return this.prisma.pipelineRun.findMany({
      where: { integrationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  updatePipelineRunStatus(id: string, status: string) {
    return this.prisma.pipelineRun.update({ where: { id }, data: { status } });
  }

  listPrChecks(integrationId: string) {
    return this.prisma.pullRequestCheck.findMany({
      where: { integrationId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
