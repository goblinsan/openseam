import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AccountsModule } from './accounts/accounts.module';
import { ContactsModule } from './contacts/contacts.module';
import { LeadsModule } from './leads/leads.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { InterviewsModule } from './interviews/interviews.module';
import { EvidenceModule } from './evidence/evidence.module';
import { HypothesesModule } from './hypotheses/hypotheses.module';
import { IntakeModule } from './intake/intake.module';
import { ScoringModule } from './scoring/scoring.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { InventoryModule } from './inventory/inventory.module';
import { PortabilityScoringModule } from './portability-scoring/portability-scoring.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AccountsModule,
    ContactsModule,
    LeadsModule,
    OpportunitiesModule,
    InterviewsModule,
    EvidenceModule,
    HypothesesModule,
    IntakeModule,
    ScoringModule,
    AssessmentsModule,
    InventoryModule,
    PortabilityScoringModule,
    RecommendationsModule,
    ReportsModule,
  ],
})
export class AppModule {}
