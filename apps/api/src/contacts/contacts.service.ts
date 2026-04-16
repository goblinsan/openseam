import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateContactDto) {
    return this.prisma.contact.create({ data: dto });
  }

  findAll(params: { accountId?: string } = {}) {
    const where: any = {};
    if (params.accountId) where.accountId = params.accountId;
    return this.prisma.contact.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.contact.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateContactDto) {
    return this.prisma.contact.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.contact.delete({ where: { id } });
  }
}
