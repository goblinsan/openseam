import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyzeImpactDto } from './dto/analyze-impact.dto';

@Injectable()
export class ImpactsService {
  constructor(private prisma: PrismaService) {}

  async analyze(dto: AnalyzeImpactDto) {
    const { projectId, artifactType, before, after } = dto;

    const risks = this.detectRisks(artifactType, before, after);
    const portabilityDelta = this.estimatePortabilityDelta(artifactType, before, after);
    const summary = {
      changeType: before && after ? 'modification' : after ? 'addition' : 'deletion',
      overallRisk: risks.some((r: { severity: string }) => r.severity === 'critical')
        ? 'critical'
        : risks.some((r: { severity: string }) => r.severity === 'high')
        ? 'high'
        : risks.some((r: { severity: string }) => r.severity === 'medium')
        ? 'medium'
        : 'low',
      portabilityScoreDelta: portabilityDelta,
      affectedResources: risks.length,
    };

    const recommendations = risks.map((r: { title: string; description: string; severity: string }) => ({
      title: `Mitigate: ${r.title}`,
      description: r.description,
      priority: r.severity === 'critical' || r.severity === 'high' ? 'high' : 'medium',
    }));

    return this.prisma.changeImpactReport.create({
      data: {
        projectId,
        artifactType,
        summary,
        risks,
        recommendations,
        portabilityImpact: portabilityDelta !== 0
          ? { previousScore: 75, projectedScore: 75 + portabilityDelta, delta: portabilityDelta }
          : undefined,
      },
    });
  }

  private detectRisks(artifactType: string, _before: unknown, after: unknown): Array<{ title: string; description: string; severity: string; affectedComponent?: string }> {
    const risks: Array<{ title: string; description: string; severity: string; affectedComponent?: string }> = [];
    if (!after) return risks;

    const payload = after as Record<string, unknown>;

    if (artifactType === 'manifest' || artifactType === 'blueprint') {
      if (payload.provider === 'aws' || (typeof payload.provider === 'string' && payload.provider.includes('aws'))) {
        risks.push({
          title: 'AWS-specific provider dependency',
          description: 'Using AWS-specific provider increases vendor lock-in risk.',
          severity: 'medium',
          affectedComponent: 'provider',
        });
      }
      if (payload.proprietary === true) {
        risks.push({
          title: 'Proprietary service detected',
          description: 'Use of proprietary services reduces portability.',
          severity: 'high',
          affectedComponent: 'service',
        });
      }
    }

    if (artifactType === 'policy') {
      if (!payload.enforcement) {
        risks.push({
          title: 'Missing policy enforcement',
          description: 'Policy lacks enforcement rules which reduces governance coverage.',
          severity: 'medium',
        });
      }
    }

    return risks;
  }

  private estimatePortabilityDelta(artifactType: string, _before: unknown, after: unknown): number {
    if (!after) return 0;
    const payload = after as Record<string, unknown>;
    let delta = 0;
    if (payload.proprietary === true) delta -= 10;
    if (artifactType === 'pattern' && payload.portability === 'high') delta += 5;
    return delta;
  }

  listReports(projectId?: string) {
    return this.prisma.changeImpactReport.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  getReport(id: string) {
    return this.prisma.changeImpactReport.findUnique({ where: { id } });
  }

  listProjectReports(projectId: string) {
    return this.prisma.changeImpactReport.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
