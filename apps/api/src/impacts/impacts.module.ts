import { Module } from '@nestjs/common';
import { ImpactsService } from './impacts.service';
import { ImpactsController } from './impacts.controller';

@Module({ controllers: [ImpactsController], providers: [ImpactsService] })
export class ImpactsModule {}
