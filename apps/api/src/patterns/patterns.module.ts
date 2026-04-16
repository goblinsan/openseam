import { Module } from '@nestjs/common';
import { PatternsService } from './patterns.service';
import { PatternsController } from './patterns.controller';

@Module({ controllers: [PatternsController], providers: [PatternsService] })
export class PatternsModule {}
