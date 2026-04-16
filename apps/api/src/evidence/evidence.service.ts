import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { UpdateEvidenceDto } from './dto/update-evidence.dto';

@Injectable()
export class EvidenceService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateEvidenceDto) {
    return this.prisma.evidence.create({ data: dto });
  }

  findAll(params: { category?: string; accountId?: string; search?: string } = {}) {
    const where: any = {};
    if (params.category) where.category = params.category;
    if (params.accountId) where.accountId = params.accountId;
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.evidence.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.evidence.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateEvidenceDto) {
    return this.prisma.evidence.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.evidence.delete({ where: { id } });
  }
}
