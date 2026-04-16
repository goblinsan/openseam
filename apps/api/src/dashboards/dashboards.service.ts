import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardsService {
  constructor(private prisma: PrismaService) {}

  async getExecutiveDashboard(workspaceId?: string) {
    const [projects, assessments, scenarios, workflows, impactReports] = await Promise.all([
      this.prisma.project.findMany({
        where: workspaceId ? { workspaceId } : undefined,
      }),
      this.prisma.assessment.findMany({
        include: { portabilityScore: true },
      }),
      this.prisma.migrationScenario.findMany({ include: { report: true } }),
      this.prisma.workflow.findMany(),
      this.prisma.changeImpactReport.findMany(),
    ]);

    const scoredAssessments = assessments.filter((a) => a.portabilityScore !== null);
    const avgPortabilityScore =
      scoredAssessments.length > 0
        ? scoredAssessments.reduce((sum, a) => sum + (a.portabilityScore?.overallScore ?? 0), 0) /
          scoredAssessments.length
        : 0;

    const highRiskProjects = impactReports.filter((r) => {
      const summary = r.summary as Record<string, unknown>;
      return summary?.overallRisk === 'critical' || summary?.overallRisk === 'high';
    }).length;

    const summary = {
      totalProjects: projects.length,
      averagePortabilityScore: Math.round(avgPortabilityScore * 10) / 10,
      highRiskProjects,
    };

    return {
      workspaceId,
      summary,
      portability: this.buildPortabilityMetrics(assessments),
      risks: this.buildRiskMetrics(impactReports),
      providers: this.buildProviderMetrics(assessments),
      governance: this.buildGovernanceMetrics(workflows, impactReports),
      migration: this.buildMigrationMetrics(scenarios),
    };
  }

  async getPortfolioMetrics(workspaceId?: string) {
    const projects = await this.prisma.project.findMany({
      where: workspaceId ? { workspaceId } : undefined,
      include: { environments: true },
    });
    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      environmentCount: p.environments.length,
    }));
  }

  async getRiskMetrics() {
    const reports = await this.prisma.changeImpactReport.findMany();
    return this.buildRiskMetrics(reports);
  }

  async getProviderMetrics() {
    const assessments = await this.prisma.assessment.findMany({
      include: { inventory: { include: { services: true } } },
    });
    const counts = { aws: 0, gcp: 0, azure: 0, other: 0 };
    assessments.forEach((a) => {
      a.inventory?.services.forEach((s) => {
        const p = s.provider.toLowerCase();
        if (p === 'aws') counts.aws++;
        else if (p === 'gcp') counts.gcp++;
        else if (p === 'azure') counts.azure++;
        else counts.other++;
      });
    });
    return counts;
  }

  async getGovernanceMetrics() {
    const [workflows, impactReports] = await Promise.all([
      this.prisma.workflow.findMany(),
      this.prisma.changeImpactReport.findMany(),
    ]);
    return this.buildGovernanceMetrics(workflows, impactReports);
  }

  async getTrendMetrics() {
    const scores = await this.prisma.portabilityScore.findMany({
      orderBy: { calculatedAt: 'asc' },
      take: 30,
      select: { calculatedAt: true, overallScore: true },
    });
    return scores.map((s) => ({
      date: s.calculatedAt.toISOString().split('T')[0],
      portabilityScore: s.overallScore,
    }));
  }

  private buildPortabilityMetrics(assessments: Array<{ id: string; projectName: string; portabilityScore: { overallScore: number } | null }>) {
    const scoresByProject: Record<string, number> = {};
    assessments.forEach((a) => {
      if (a.portabilityScore) {
        scoresByProject[a.projectName] = a.portabilityScore.overallScore;
      }
    });
    return { scoresByProject };
  }

  private buildRiskMetrics(reports: Array<{ summary: unknown }>) {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    reports.forEach((r) => {
      const summary = r.summary as Record<string, unknown>;
      const risk = (summary?.overallRisk as string) ?? 'low';
      if (risk in counts) counts[risk as keyof typeof counts]++;
    });
    return counts;
  }

  private buildProviderMetrics(assessments: Array<{ portabilityScore: { dimensions: unknown } | null }>) {
    const counts = { aws: 0, gcp: 0, azure: 0 };
    assessments.forEach((a) => {
      if (!a.portabilityScore) return;
      const dims = a.portabilityScore.dimensions as Array<{ provider?: string }>;
      if (Array.isArray(dims)) {
        dims.forEach((d) => {
          const p = d.provider?.toLowerCase();
          if (p === 'aws') counts.aws++;
          else if (p === 'gcp') counts.gcp++;
          else if (p === 'azure') counts.azure++;
        });
      }
    });
    return counts;
  }

  private buildGovernanceMetrics(workflows: Array<{ status: string }>, impactReports: Array<{ summary: unknown }>) {
    const approvedWorkflows = workflows.filter((w) => w.status === 'approved').length;
    const totalWorkflows = workflows.length;
    const complianceScore = totalWorkflows > 0 ? Math.round((approvedWorkflows / totalWorkflows) * 100) : 100;
    const violations = impactReports.filter((r) => {
      const summary = r.summary as Record<string, unknown>;
      return summary?.overallRisk === 'critical';
    }).length;
    return { complianceScore, violations };
  }

  private buildMigrationMetrics(scenarios: Array<{ status: string; report: { estimatedCost: number; complexity: string } | null }>) {
    const completed = scenarios.filter((s) => s.status === 'completed').length;
    const pending = scenarios.filter((s) => s.status === 'pending').length;
    const avgCost = scenarios
      .filter((s) => s.report)
      .reduce((sum, s) => sum + (s.report?.estimatedCost ?? 0), 0) / Math.max(1, scenarios.filter((s) => s.report).length);
    return { total: scenarios.length, completed, pending, averageEstimatedCost: Math.round(avgCost) };
  }
}
