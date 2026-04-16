import { Module } from '@nestjs/common';
import { PortabilityScoringService } from './portability-scoring.service';
import { PortabilityScoringController } from './portability-scoring.controller';

@Module({ controllers: [PortabilityScoringController], providers: [PortabilityScoringService] })
export class PortabilityScoringModule {}
