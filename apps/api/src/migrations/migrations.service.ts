import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMigrationScenarioDto } from './dto/create-migration-scenario.dto';

const SERVICE_MAPPINGS: Record<string, Record<string, { targetService: string; portabilityClassification: string }[]>> = {
  aws: {
    azure: [
      { targetService: 'Azure Kubernetes Service', portabilityClassification: 'portable' },
      { targetService: 'Azure Functions', portabilityClassification: 'cloud_native' },
      { targetService: 'Azure Blob Storage', portabilityClassification: 'cloud_native' },
    ],
    gcp: [
      { targetService: 'Google Kubernetes Engine', portabilityClassification: 'portable' },
      { targetService: 'Cloud Run', portabilityClassification: 'portable' },
      { targetService: 'Cloud Storage', portabilityClassification: 'cloud_native' },
    ],
  },
  azure: {
    aws: [
      { targetService: 'Amazon EKS', portabilityClassification: 'portable' },
      { targetService: 'AWS Lambda', portabilityClassification: 'cloud_native' },
      { targetService: 'Amazon S3', portabilityClassification: 'cloud_native' },
    ],
    gcp: [
      { targetService: 'Google Kubernetes Engine', portabilityClassification: 'portable' },
      { targetService: 'Cloud Run', portabilityClassification: 'portable' },
      { targetService: 'Cloud Storage', portabilityClassification: 'cloud_native' },
    ],
  },
  gcp: {
    aws: [
      { targetService: 'Amazon EKS', portabilityClassification: 'portable' },
      { targetService: 'AWS Lambda', portabilityClassification: 'cloud_native' },
      { targetService: 'Amazon S3', portabilityClassification: 'cloud_native' },
    ],
    azure: [
      { targetService: 'Azure Kubernetes Service', portabilityClassification: 'portable' },
      { targetService: 'Azure Functions', portabilityClassification: 'cloud_native' },
      { targetService: 'Azure Blob Storage', portabilityClassification: 'cloud_native' },
    ],
  },
};

@Injectable()
export class MigrationsService {
  constructor(private prisma: PrismaService) {}

  createScenario(dto: CreateMigrationScenarioDto) {
    return this.prisma.migrationScenario.create({ data: dto });
  }

  listScenarios(projectId?: string) {
    return this.prisma.migrationScenario.findMany({
      where: projectId ? { projectId } : undefined,
      include: { report: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  getScenario(id: string) {
    return this.prisma.migrationScenario.findUnique({
      where: { id },
      include: { report: true },
    });
  }

  async simulate(id: string) {
    const scenario = await this.prisma.migrationScenario.findUnique({ where: { id } });
    if (!scenario) throw new Error(`Scenario ${id} not found`);

    await this.prisma.migrationScenario.update({
      where: { id },
      data: { status: 'analyzing' },
    });

    const { sourceProvider, targetProvider } = scenario;
    const mappings = this.buildServiceMappings(sourceProvider, targetProvider);
    const proprietary = mappings.filter((m) => m.portabilityClassification === 'proprietary').length;
    const complexity = proprietary > 2 ? 'high' : proprietary > 0 ? 'medium' : 'low';
    const riskLevel = complexity;
    const estimatedDurationWeeks = proprietary * 4 + mappings.length * 2;
    const estimatedCost = estimatedDurationWeeks * 5000;
    const portabilityScoreImpact = -proprietary * 5 + mappings.length * 2;

    const recommendations = [
      {
        title: 'Use Kubernetes for container workloads',
        description: 'Kubernetes is supported across all major clouds and reduces migration effort.',
        priority: 'high',
      },
      {
        title: 'Adopt cloud-agnostic storage interfaces',
        description: 'Use object storage abstractions to ease portability.',
        priority: 'medium',
      },
    ];

    const report = await this.prisma.migrationReport.create({
      data: {
        scenarioId: id,
        estimatedCost,
        estimatedDurationWeeks,
        complexity,
        riskLevel,
        portabilityScoreImpact,
        serviceMappings: mappings,
        recommendations,
      },
    });

    await this.prisma.migrationScenario.update({
      where: { id },
      data: { status: 'completed' },
    });

    return report;
  }

  private buildServiceMappings(sourceProvider: string, targetProvider: string) {
    const mappings = SERVICE_MAPPINGS[sourceProvider]?.[targetProvider] ?? [];
    return mappings.map((m, idx) => ({
      sourceService: `${sourceProvider.toUpperCase()} Service ${idx + 1}`,
      sourceProvider,
      targetService: m.targetService,
      targetProvider,
      portabilityClassification: m.portabilityClassification,
    }));
  }

  getReport(id: string) {
    return this.prisma.migrationReport.findUnique({ where: { scenarioId: id } });
  }

  getMappings(id: string) {
    return this.prisma.migrationReport.findUnique({
      where: { scenarioId: id },
      select: { serviceMappings: true },
    });
  }
}
