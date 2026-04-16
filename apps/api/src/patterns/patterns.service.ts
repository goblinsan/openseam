import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatternDto } from './dto/create-pattern.dto';
import { UpdatePatternDto } from './dto/update-pattern.dto';

@Injectable()
export class PatternsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreatePatternDto) {
    return this.prisma.pattern.create({ data: dto as any });
  }

  findAll(category?: string) {
    return this.prisma.pattern.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  findCategories() {
    return this.prisma.pattern
      .findMany({ select: { category: true }, distinct: ['category'] })
      .then((rows) => rows.map((r) => r.category));
  }

  findOne(id: string) {
    return this.prisma.pattern.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdatePatternDto) {
    return this.prisma.pattern.update({ where: { id }, data: dto as any });
  }

  remove(id: string) {
    return this.prisma.pattern.delete({ where: { id } });
  }
}
