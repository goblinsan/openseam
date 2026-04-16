import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIntakeDto } from './dto/create-intake.dto';
import { UpdateIntakeDto } from './dto/update-intake.dto';

@Injectable()
export class IntakeService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateIntakeDto) {
    return this.prisma.architectureIntake.create({ data: dto as any });
  }

  findAll() {
    return this.prisma.architectureIntake.findMany({
      include: { account: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.architectureIntake.findUnique({
      where: { id },
      include: { account: true },
    });
  }

  update(id: string, dto: UpdateIntakeDto) {
    return this.prisma.architectureIntake.update({ where: { id }, data: dto as any });
  }

  submit(id: string) {
    return this.prisma.architectureIntake.update({
      where: { id },
      data: { status: 'submitted' },
    });
  }

  remove(id: string) {
    return this.prisma.architectureIntake.delete({ where: { id } });
  }
}
