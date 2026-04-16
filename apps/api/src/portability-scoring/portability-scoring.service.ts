import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MODEL_VERSION = 'v1';

const DIMENSION_WEIGHTS: Record<string, number> = {
  'Service Portability': 0.20,
  'Compute Portability': 0.15,
  'Data Portability': 0.15,
  'Integration Portability': 0.10,
  'Infrastructure Portability': 0.10,
  'Identity & Access': 0.10,
  'Observability Portability': 0.05,
  'Networking Portability': 0.05,
  'DevOps Portability': 0.05,
  'Governance Readiness': 0.05,
};

const CATEGORY_TO_DIMENSION: Record<string, string> = {
  'Object Storage': 'Service Portability',
  'Managed Kubernetes': 'Compute Portability',
  'Container Orchestration': 'Compute Portability',
  'Serverless Containers': 'Compute Portability',
  'Serverless Compute': 'Compute Portability',
  'NoSQL Database': 'Data Portability',
  'Managed SQL': 'Data Portability',
  'Message Queue': 'Integration Portability',
  'Identity & Access': 'Identity & Access',
  'Observability': 'Observability Portability',
  'Infrastructure as Code': 'Infrastructure Portability',
  'Containerization': 'Infrastructure Portability',
  'CI/CD': 'DevOps Portability',
  'Networking': 'Networking Portability',
};

const TYPE_SCORES: Record<string, number> = {
  portable: 100,
  cloud_native: 50,
  proprietary: 10,
};

@Injectable()
export class PortabilityScoringService {
  constructor(private prisma: PrismaService) {}

  private calculateRating(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  async calculate(assessmentId: string) {
    const inventory = await this.prisma.portabilityInventory.findUnique({
      where: { assessmentId },
      include: { services: true, lockInRisks: true },
    });

    if (!inventory) throw new Error(`No inventory found for assessment ${assessmentId}`);

    // Group services by dimension
    const dimensionScores: Record<string, number[]> = {};
    for (const dim of Object.keys(DIMENSION_WEIGHTS)) {
      dimensionScores[dim] = [];
    }

    for (const service of inventory.services) {
      const dimension = CATEGORY_TO_DIMENSION[service.category] ?? 'Service Portability';
      const typeScore = TYPE_SCORES[service.type] ?? 50;
      if (dimensionScores[dimension]) {
        dimensionScores[dimension].push(typeScore);
      }
    }

    const dimensions = Object.entries(DIMENSION_WEIGHTS).map(([name, weight]) => {
      const scores = dimensionScores[name];
      const rawScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 75;
      return {
        name,
        weight,
        rawScore,
        weightedScore: rawScore * weight,
      };
    });

    // Calculate deductions from lock-in risks
    const deductionMap: Record<string, number> = { critical: 5, high: 3, medium: 1, low: 0 };
    const deductions = (inventory.lockInRisks as any[]).map((risk) => ({
      category: CATEGORY_TO_DIMENSION[risk.provider] ?? 'Service Portability',
      description: risk.description,
      impact: deductionMap[risk.severity] ?? 0,
      severity: risk.severity,
      provider: risk.provider,
      service: risk.service,
    }));

    const baseScore = dimensions.reduce((sum, d) => sum + d.weightedScore, 0);
    const totalDeduction = deductions.reduce((sum, d) => sum + d.impact, 0);
    const overallScore = Math.max(0, Math.min(100, baseScore - totalDeduction));
    const rating = this.calculateRating(overallScore);

    // Upsert the portability score
    const existing = await this.prisma.portabilityScore.findUnique({ where: { assessmentId } });
    if (existing) {
      return this.prisma.portabilityScore.update({
        where: { assessmentId },
        data: { overallScore, rating, modelVersion: MODEL_VERSION, dimensions: dimensions as any, deductions: deductions as any, calculatedAt: new Date() },
      });
    }

    return this.prisma.portabilityScore.create({
      data: {
        assessmentId,
        overallScore,
        rating,
        modelVersion: MODEL_VERSION,
        dimensions: dimensions as any,
        deductions: deductions as any,
      },
    });
  }

  findOne(assessmentId: string) {
    return this.prisma.portabilityScore.findUnique({ where: { assessmentId } });
  }
}
