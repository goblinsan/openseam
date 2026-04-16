import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';

@Injectable()
export class EnvironmentsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateEnvironmentDto) {
    return this.prisma.environment.create({ data: dto });
  }

  findByProject(projectId: string) {
    return this.prisma.environment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.environment.findUnique({ where: { id } });
  }

  remove(id: string) {
    return this.prisma.environment.delete({ where: { id } });
  }
}
