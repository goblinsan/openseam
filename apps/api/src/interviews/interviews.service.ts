import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInterviewTemplateDto } from './dto/create-interview-template.dto';
import { UpdateInterviewTemplateDto } from './dto/update-interview-template.dto';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';

@Injectable()
export class InterviewsService {
  constructor(private prisma: PrismaService) {}

  // Templates
  createTemplate(dto: CreateInterviewTemplateDto) {
    return this.prisma.interviewTemplate.create({ data: dto });
  }

  findAllTemplates() {
    return this.prisma.interviewTemplate.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOneTemplate(id: string) {
    return this.prisma.interviewTemplate.findUnique({ where: { id } });
  }

  updateTemplate(id: string, dto: UpdateInterviewTemplateDto) {
    return this.prisma.interviewTemplate.update({ where: { id }, data: dto });
  }

  // Interviews
  create(dto: CreateInterviewDto) {
    return this.prisma.interview.create({ data: dto as any });
  }

  findAll(params: { accountId?: string; status?: string } = {}) {
    const where: any = {};
    if (params.accountId) where.accountId = params.accountId;
    if (params.status) where.status = params.status;
    return this.prisma.interview.findMany({
      where,
      include: {
        account: { select: { id: true, name: true } },
        template: { select: { id: true, name: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.interview.findUnique({
      where: { id },
      include: { account: true, opportunity: true, template: true, evidence: true },
    });
  }

  update(id: string, dto: UpdateInterviewDto) {
    return this.prisma.interview.update({ where: { id }, data: dto as any });
  }
}
