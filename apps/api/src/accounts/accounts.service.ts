import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateAccountDto) {
    return this.prisma.account.create({ data: dto });
  }

  findAll(params: { search?: string; isDesignPartner?: boolean } = {}) {
    const where: any = {};
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { industry: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.isDesignPartner !== undefined) {
      where.isDesignPartner =
        params.isDesignPartner === true || params.isDesignPartner === ('true' as any);
    }
    return this.prisma.account.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.account.findUnique({
      where: { id },
      include: { contacts: true, opportunities: true, interviews: true },
    });
  }

  update(id: string, dto: UpdateAccountDto) {
    return this.prisma.account.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.account.delete({ where: { id } });
  }
}
