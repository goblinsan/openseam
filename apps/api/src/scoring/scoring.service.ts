import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalculateScoreDto } from './dto/calculate-score.dto';
import { UpdateWeightsDto } from './dto/update-weights.dto';

const DEFAULT_WEIGHTS = {
  strategicFit: 0.20,
  cloudComplexity: 0.15,
  vendorLockInRisk: 0.15,
  technicalMaturity: 0.10,
  revenuePotential: 0.15,
  urgency: 0.10,
  regulatoryPressure: 0.05,
  innovationReadiness: 0.05,
  designPartnerPotential: 0.03,
  referenceValue: 0.02,
};

@Injectable()
export class ScoringService {
  constructor(private prisma: PrismaService) {}

  private calculateRating(score: number): string {
    if (score >= 80) return 'strategic';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  private async getWeights() {
    const config = await this.prisma.scoringConfig.findFirst({ orderBy: { updatedAt: 'desc' } });
    return config ?? DEFAULT_WEIGHTS;
  }

  async calculate(dto: CalculateScoreDto) {
    const weights = await this.getWeights();

    const dimensions = [
      { name: 'Strategic Fit', value: dto.strategicFit ?? 50, weight: weights.strategicFit },
      { name: 'Cloud Complexity', value: dto.cloudComplexity ?? 50, weight: weights.cloudComplexity },
      { name: 'Vendor Lock-in Risk', value: dto.vendorLockInRisk ?? 50, weight: weights.vendorLockInRisk },
      { name: 'Technical Maturity', value: dto.technicalMaturity ?? 50, weight: weights.technicalMaturity },
      { name: 'Revenue Potential', value: dto.revenuePotential ?? 50, weight: weights.revenuePotential },
      { name: 'Urgency', value: dto.urgency ?? 50, weight: weights.urgency },
      { name: 'Regulatory Pressure', value: dto.regulatoryPressure ?? 50, weight: weights.regulatoryPressure },
      { name: 'Innovation Readiness', value: dto.innovationReadiness ?? 50, weight: weights.innovationReadiness },
      { name: 'Design Partner Potential', value: dto.designPartnerPotential ?? 50, weight: weights.designPartnerPotential },
      { name: 'Reference Value', value: dto.referenceValue ?? 50, weight: weights.referenceValue },
    ];

    const breakdown = dimensions.map((d) => ({
      dimension: d.name,
      score: d.value,
      weight: d.weight,
      weightedScore: d.value * d.weight,
    }));

    const totalScore = breakdown.reduce((sum, b) => sum + b.weightedScore, 0);
    const rating = this.calculateRating(totalScore);

    return this.prisma.opportunityScore.create({
      data: {
        accountId: dto.accountId,
        opportunityId: dto.opportunityId,
        totalScore,
        rating,
        breakdown: breakdown as any,
      },
    });
  }

  findAll() {
    return this.prisma.opportunityScore.findMany({
      include: { account: { select: { id: true, name: true } } },
      orderBy: { calculatedAt: 'desc' },
    });
  }

  findByAccount(accountId: string) {
    return this.prisma.opportunityScore.findMany({
      where: { accountId },
      orderBy: { calculatedAt: 'desc' },
    });
  }

  async getRankings() {
    const scores = await this.prisma.opportunityScore.findMany({
      include: { account: { select: { id: true, name: true } } },
      orderBy: { totalScore: 'desc' },
    });
    return scores;
  }

  async updateWeights(dto: UpdateWeightsDto) {
    const current = await this.prisma.scoringConfig.findFirst({ orderBy: { updatedAt: 'desc' } });
    if (current) {
      return this.prisma.scoringConfig.update({ where: { id: current.id }, data: dto });
    }
    return this.prisma.scoringConfig.create({ data: { ...DEFAULT_WEIGHTS, ...dto } });
  }

  async getWeightsConfig() {
    const config = await this.prisma.scoringConfig.findFirst({ orderBy: { updatedAt: 'desc' } });
    return config ?? DEFAULT_WEIGHTS;
  }
}
