import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateLeadDto) {
    return this.prisma.lead.create({ data: dto });
  }

  findAll(params: { status?: string; search?: string } = {}) {
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { company: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.lead.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateLeadDto) {
    return this.prisma.lead.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.lead.delete({ where: { id } });
  }
}
