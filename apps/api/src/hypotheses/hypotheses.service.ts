import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHypothesisDto } from './dto/create-hypothesis.dto';
import { UpdateHypothesisDto } from './dto/update-hypothesis.dto';

@Injectable()
export class HypothesesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateHypothesisDto) {
    const { evidenceIds, ...data } = dto;
    return this.prisma.hypothesis.create({
      data: {
        ...data,
        ...(evidenceIds && {
          evidence: { connect: evidenceIds.map((id) => ({ id })) },
        }),
      },
      include: { evidence: true },
    });
  }

  findAll(params: { status?: string } = {}) {
    const where: any = {};
    if (params.status) where.status = params.status;
    return this.prisma.hypothesis.findMany({
      where,
      include: { evidence: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.hypothesis.findUnique({
      where: { id },
      include: { evidence: true },
    });
  }

  update(id: string, dto: UpdateHypothesisDto) {
    const { evidenceIds, ...data } = dto;
    return this.prisma.hypothesis.update({
      where: { id },
      data: {
        ...data,
        ...(evidenceIds && {
          evidence: { set: evidenceIds.map((eid) => ({ id: eid })) },
        }),
      },
      include: { evidence: true },
    });
  }
}
