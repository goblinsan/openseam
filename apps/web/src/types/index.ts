export type PipelineStage =
  | 'prospect'
  | 'qualified'
  | 'design_partner'
  | 'closed_won'
  | 'closed_lost';

export interface Account {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  description?: string;
  isDesignPartner: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  contacts?: Contact[];
  opportunities?: Opportunity[];
  interviews?: Interview[];
}

export interface Contact {
  id: string;
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  source?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  accountId: string;
  account?: { id: string; name: string };
  title: string;
  stage: PipelineStage;
  value?: number;
  isDesignPartner: boolean;
  closeDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewTemplate {
  id: string;
  name: string;
  persona: string;
  description?: string;
  questions: string[];
  createdAt: string;
  updatedAt: string;
}

export type InterviewStatus = 'scheduled' | 'completed' | 'analyzed';

export interface Interview {
  id: string;
  accountId: string;
  account?: { id: string; name: string };
  opportunityId?: string;
  templateId?: string;
  template?: { id: string; name: string };
  interviewer: string;
  interviewee: string;
  persona: string;
  status: InterviewStatus;
  scheduledAt: string;
  completedAt?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type EvidenceCategory =
  | 'customer_interview'
  | 'market_research'
  | 'architecture_assessment'
  | 'portability_risk'
  | 'compliance_requirement'
  | 'product_feedback'
  | 'competitive_analysis'
  | 'strategic_hypothesis';

export interface Evidence {
  id: string;
  title: string;
  description: string;
  category: EvidenceCategory;
  sourceType: string;
  sourceReference?: string;
  tags: string[];
  accountId?: string;
  opportunityId?: string;
  interviewId?: string;
  hypothesisId?: string;
  confidence: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type HypothesisStatus = 'unvalidated' | 'validated' | 'invalidated';

export interface Hypothesis {
  id: string;
  statement: string;
  status: HypothesisStatus;
  evidence: Evidence[];
  createdAt: string;
  updatedAt: string;
}

export interface ArchitectureIntake {
  id: string;
  accountId?: string;
  account?: { id: string; name: string };
  organizationName: string;
  applicationName: string;
  description?: string;
  primaryContact: string;
  cloudProviders: string[];
  environments: string[];
  compute: Record<string, unknown>;
  storage: Record<string, unknown>;
  messaging: Record<string, unknown>;
  identity: Record<string, unknown>;
  networking: Record<string, unknown>;
  cicd: Record<string, unknown>;
  observability: Record<string, unknown>;
  security: Record<string, unknown>;
  compliance: string[];
  dataResidency?: string;
  disasterRecovery?: string;
  integrations?: string[];
  portabilityGoals?: string;
  status: 'draft' | 'submitted';
  createdAt: string;
  updatedAt: string;
}

export type OpportunityRating = 'low' | 'medium' | 'high' | 'strategic';

export interface ScoreBreakdown {
  dimension: string;
  score: number;
  weight: number;
  weightedScore: number;
}

export interface OpportunityScore {
  id: string;
  accountId: string;
  account?: { id: string; name: string };
  opportunityId?: string;
  totalScore: number;
  rating: OpportunityRating;
  calculatedAt: string;
  breakdown: ScoreBreakdown[];
}
