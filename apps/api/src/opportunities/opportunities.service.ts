import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateOpportunityDto) {
    return this.prisma.opportunity.create({ data: dto as any });
  }

  findAll(params: { stage?: string; isDesignPartner?: boolean; accountId?: string } = {}) {
    const where: any = {};
    if (params.stage) where.stage = params.stage;
    if (params.accountId) where.accountId = params.accountId;
    if (params.isDesignPartner !== undefined) {
      where.isDesignPartner =
        params.isDesignPartner === true || params.isDesignPartner === ('true' as any);
    }
    return this.prisma.opportunity.findMany({
      where,
      include: { account: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.opportunity.findUnique({
      where: { id },
      include: { account: true, interviews: true, evidence: true, scores: true },
    });
  }

  update(id: string, dto: UpdateOpportunityDto) {
    return this.prisma.opportunity.update({ where: { id }, data: dto as any });
  }

  remove(id: string) {
    return this.prisma.opportunity.delete({ where: { id } });
  }
}
