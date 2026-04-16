import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create account' })
  create(@Body() dto: CreateAccountDto) {
    return this.accountsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List accounts' })
  findAll(
    @Query('search') search?: string,
    @Query('isDesignPartner') isDesignPartner?: boolean,
  ) {
    return this.accountsService.findAll({ search, isDesignPartner });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account' })
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update account' })
  update(@Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return this.accountsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account' })
  remove(@Param('id') id: string) {
    return this.accountsService.remove(id);
  }
}
