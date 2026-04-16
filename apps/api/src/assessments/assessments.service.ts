import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';

@Injectable()
export class AssessmentsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateAssessmentDto) {
    return this.prisma.assessment.create({ data: dto });
  }

  findAll() {
    return this.prisma.assessment.findMany({
      include: {
        intake: { select: { id: true, organizationName: true, applicationName: true } },
        portabilityScore: true,
        _count: { select: { recommendations: true, reports: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.assessment.findUnique({
      where: { id },
      include: {
        intake: true,
        inventory: { include: { services: true, lockInRisks: true } },
        portabilityScore: true,
        recommendations: true,
        reports: true,
      },
    });
  }

  update(id: string, dto: UpdateAssessmentDto) {
    return this.prisma.assessment.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.assessment.delete({ where: { id } });
  }
}
