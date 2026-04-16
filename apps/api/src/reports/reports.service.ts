import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private formatRating(rating: string): string {
    return rating ? rating.charAt(0).toUpperCase() + rating.slice(1) : 'N/A';
  }

  private buildMarkdownReport(assessment: any): string {
    const score = assessment.portabilityScore;
    const inventory = assessment.inventory;
    const recommendations = assessment.recommendations ?? [];
    const intake = assessment.intake;

    const lines: string[] = [];

    lines.push(`# OpenSeam Portability Assessment Report`);
    lines.push(`\n**Organization:** ${assessment.organizationName}`);
    lines.push(`**Project:** ${assessment.projectName}`);
    lines.push(`**Assessment:** ${assessment.name}`);
    lines.push(`**Generated:** ${new Date().toISOString().split('T')[0]}`);
    lines.push(`**Status:** ${this.formatRating(assessment.status)}`);

    lines.push(`\n---\n`);
    lines.push(`## Executive Summary`);
    if (score) {
      lines.push(`\nThis assessment evaluated the cloud portability of **${assessment.projectName}** for **${assessment.organizationName}**.`);
      lines.push(`\n**Overall Portability Score: ${score.overallScore.toFixed(1)}/100 (${this.formatRating(score.rating)})**`);
      lines.push(`\nThe assessment identified ${inventory?.services?.length ?? 0} cloud services, ${inventory?.lockInRisks?.length ?? 0} lock-in risks, and generated ${recommendations.length} actionable recommendations.`);
    } else {
      lines.push(`\nPortability score has not been calculated yet. Run the scoring engine to generate insights.`);
    }

    if (recommendations.length > 0) {
      const highPriority = recommendations.filter((r: any) => r.priority === 'high' || r.priority === 'critical');
      if (highPriority.length > 0) {
        lines.push(`\n### Key Strategic Recommendations`);
        for (const rec of highPriority.slice(0, 3)) {
          lines.push(`- **${rec.title}**: ${rec.description}`);
        }
      }
    }

    lines.push(`\n---\n`);
    lines.push(`## Assessment Overview`);
    lines.push(`\n### Scope & Objectives`);
    lines.push(`This assessment evaluates the cloud architecture portability for ${assessment.organizationName}, identifying vendor lock-in risks and providing actionable remediation guidance.`);

    if (intake) {
      lines.push(`\n### Architecture Summary`);
      lines.push(`- **Application:** ${intake.applicationName ?? 'N/A'}`);
      lines.push(`- **Cloud Providers:** ${(intake.cloudProviders ?? []).join(', ') || 'N/A'}`);
      lines.push(`- **Environments:** ${(intake.environments ?? []).join(', ') || 'N/A'}`);
      if (intake.portabilityGoals) {
        lines.push(`- **Portability Goals:** ${intake.portabilityGoals}`);
      }
    }

    if (score) {
      lines.push(`\n---\n`);
      lines.push(`## Portability Scorecard`);
      lines.push(`\n**Overall Score: ${score.overallScore.toFixed(1)}/100**`);
      lines.push(`**Rating: ${this.formatRating(score.rating)}**`);
      lines.push(`**Model Version: ${score.modelVersion}**`);

      if (score.dimensions && Array.isArray(score.dimensions)) {
        lines.push(`\n### Dimension Breakdown`);
        lines.push(`\n| Dimension | Weight | Raw Score | Weighted Score |`);
        lines.push(`|-----------|--------|-----------|----------------|`);
        for (const dim of score.dimensions as any[]) {
          lines.push(`| ${dim.name} | ${(dim.weight * 100).toFixed(0)}% | ${dim.rawScore.toFixed(1)} | ${dim.weightedScore.toFixed(2)} |`);
        }
      }
    }

    if (inventory) {
      lines.push(`\n---\n`);
      lines.push(`## Dependency Inventory`);
      lines.push(`\n**Total Services Identified:** ${inventory.services?.length ?? 0}`);

      if (inventory.providerSummaries && Array.isArray(inventory.providerSummaries)) {
        lines.push(`\n### Provider Distribution`);
        lines.push(`\n| Provider | Services | Proprietary | Risk Level |`);
        lines.push(`|----------|----------|-------------|------------|`);
        for (const ps of inventory.providerSummaries as any[]) {
          lines.push(`| ${ps.provider.toUpperCase()} | ${ps.serviceCount} | ${ps.proprietaryServices} | ${this.formatRating(ps.portabilityRiskLevel)} |`);
        }
      }

      if (inventory.services?.length > 0) {
        lines.push(`\n### Identified Services`);
        lines.push(`\n| Service | Provider | Category | Type |`);
        lines.push(`|---------|----------|----------|------|`);
        for (const svc of inventory.services as any[]) {
          lines.push(`| ${svc.name} | ${svc.provider.toUpperCase()} | ${svc.category} | ${this.formatRating(svc.type.replace('_', ' '))} |`);
        }
      }
    }

    if (inventory?.lockInRisks?.length > 0) {
      lines.push(`\n---\n`);
      lines.push(`## Risk Analysis`);
      lines.push(`\n| Service | Provider | Severity | Description |`);
      lines.push(`|---------|----------|----------|-------------|`);
      for (const risk of inventory.lockInRisks as any[]) {
        lines.push(`| ${risk.service} | ${risk.provider.toUpperCase()} | ${this.formatRating(risk.severity)} | ${risk.description} |`);
      }
    }

    if (recommendations.length > 0) {
      lines.push(`\n---\n`);
      lines.push(`## Recommendations`);
      for (const rec of recommendations as any[]) {
        lines.push(`\n### ${rec.title}`);
        lines.push(`**Priority:** ${this.formatRating(rec.priority)} | **Impact:** ${this.formatRating(rec.impact)} | **Effort:** ${this.formatRating(rec.effort)}`);
        lines.push(`\n${rec.description}`);
        lines.push(`\n**Rationale:** ${rec.rationale}`);
        lines.push(`\n**Implementation Guidance:** ${rec.implementationGuidance}`);
        if (rec.relatedServices?.length > 0) {
          lines.push(`\n*Related Services: ${rec.relatedServices.join(', ')}*`);
        }
      }
    }

    lines.push(`\n---\n`);
    lines.push(`## Appendix`);
    lines.push(`\n### Scoring Methodology`);
    lines.push(`The OpenSeam Portability Scoring Model v1 uses 10 weighted dimensions:`);
    lines.push(`- Service Portability (20%), Compute Portability (15%), Data Portability (15%)`);
    lines.push(`- Integration Portability (10%), Infrastructure Portability (10%), Identity & Access (10%)`);
    lines.push(`- Observability (5%), Networking (5%), DevOps (5%), Governance (5%)`);
    lines.push(`\nRatings: Poor (<40) | Fair (40-60) | Good (60-80) | Excellent (>80)`);

    return lines.join('\n');
  }

  async generate(assessmentId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        intake: true,
        inventory: { include: { services: true, lockInRisks: true } },
        portabilityScore: true,
        recommendations: true,
      },
    });

    if (!assessment) throw new Error(`Assessment ${assessmentId} not found`);

    const content = this.buildMarkdownReport(assessment);
    const metadata = {
      portabilityScore: assessment.portabilityScore?.overallScore,
      riskCount: assessment.inventory?.lockInRisks?.length ?? 0,
      recommendationCount: assessment.recommendations?.length ?? 0,
      providers: (assessment.inventory?.providerSummaries as any[])?.map((p) => p.provider) ?? [],
    };

    return this.prisma.advisoryReport.create({
      data: {
        assessmentId,
        title: `${assessment.name} - Portability Assessment Report`,
        organizationName: assessment.organizationName,
        format: 'markdown',
        version: '1.0',
        content,
        metadata: metadata as any,
      },
    });
  }

  findAll() {
    return this.prisma.advisoryReport.findMany({
      orderBy: { generatedAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.advisoryReport.findUnique({ where: { id } });
  }

  findByAssessment(assessmentId: string) {
    return this.prisma.advisoryReport.findMany({
      where: { assessmentId },
      orderBy: { generatedAt: 'desc' },
    });
  }
}
