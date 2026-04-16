// ============ CRM Types ============

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
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Opportunity {
  id: string;
  accountId: string;
  title: string;
  stage: PipelineStage;
  value?: number;
  isDesignPartner: boolean;
  closeDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============ Interview Types ============

export interface InterviewTemplate {
  id: string;
  name: string;
  persona: string;
  description?: string;
  questions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type InterviewStatus = 'scheduled' | 'completed' | 'analyzed';

export interface Interview {
  id: string;
  accountId: string;
  opportunityId?: string;
  templateId?: string;
  interviewer: string;
  interviewee: string;
  persona: string;
  status: InterviewStatus;
  scheduledAt: Date;
  completedAt?: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============ Evidence Types ============

export type EvidenceCategory =
  | 'customer_interview'
  | 'market_research'
  | 'architecture_assessment'
  | 'portability_risk'
  | 'compliance_requirement'
  | 'product_feedback'
  | 'competitive_analysis'
  | 'strategic_hypothesis';

export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type ImpactLevel = 'low' | 'medium' | 'high';

export interface EvidenceSource {
  type: 'interview' | 'assessment' | 'research' | 'internal' | 'external';
  reference?: string;
}

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
  confidence: ConfidenceLevel;
  impact: ImpactLevel;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type HypothesisStatus = 'unvalidated' | 'validated' | 'invalidated';

export interface Hypothesis {
  id: string;
  statement: string;
  status: HypothesisStatus;
  evidenceIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============ Architecture Intake Types ============

export type CloudProvider = 'aws' | 'azure' | 'gcp' | 'other';
export type IntakeStatus = 'draft' | 'submitted';

export interface ComputeConfig {
  services: string[];
  orchestration?: string;
}

export interface StorageConfig {
  databases: string[];
  objectStorage: string[];
  fileStorage?: string[];
}

export interface MessagingConfig {
  queues?: string[];
  streams?: string[];
  pubsub?: string[];
}

export interface IdentityConfig {
  providers: string[];
  iamSystems?: string[];
}

export interface NetworkingConfig {
  vpcs?: string[];
  loadBalancers?: string[];
  gateways?: string[];
}

export interface CICDConfig {
  tools: string[];
}

export interface ObservabilityConfig {
  logging?: string[];
  monitoring?: string[];
  tracing?: string[];
}

export interface SecurityConfig {
  tools?: string[];
  policies?: string[];
}

export interface ArchitectureIntake {
  id: string;
  organizationName: string;
  applicationName: string;
  description?: string;
  primaryContact: string;
  cloudProviders: CloudProvider[];
  environments: string[];
  compute: ComputeConfig;
  storage: StorageConfig;
  messaging: MessagingConfig;
  identity: IdentityConfig;
  networking: NetworkingConfig;
  cicd: CICDConfig;
  observability: ObservabilityConfig;
  security: SecurityConfig;
  compliance: string[];
  dataResidency?: string;
  disasterRecovery?: string;
  integrations?: string[];
  portabilityGoals?: string;
  status: IntakeStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ============ Scoring Types ============

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
  opportunityId?: string;
  totalScore: number;
  rating: OpportunityRating;
  calculatedAt: Date;
  breakdown: ScoreBreakdown[];
}

export interface ScoringWeights {
  strategicFit: number;
  cloudComplexity: number;
  vendorLockInRisk: number;
  technicalMaturity: number;
  revenuePotential: number;
  urgency: number;
  regulatoryPressure: number;
  innovationReadiness: number;
  designPartnerPotential: number;
  referenceValue: number;
}

export interface OpportunityProfile {
  accountId: string;
  industry?: string;
  cloudProviders?: string[];
  engineeringMaturity?: number;
  lockInRisk?: number;
  estimatedDealValue?: number;
  urgencyLevel?: number;
  complianceRequirements?: string[];
  strategicFit?: number;
  cloudComplexity?: number;
  vendorLockInRisk?: number;
  technicalMaturity?: number;
  revenuePotential?: number;
  urgency?: number;
  regulatoryPressure?: number;
  innovationReadiness?: number;
  designPartnerPotential?: number;
  referenceValue?: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  strategicFit: 0.20,
  cloudComplexity: 0.15,
  vendorLockInRisk: 0.15,
  technicalMaturity: 0.10,
  revenuePotential: 0.15,
  urgency: 0.10,
  regulatoryPressure: 0.05,
  innovationReadiness: 0.05,
  designPartnerPotential: 0.03,
  referenceValue: 0.02,
};

// ============ Assessment OS Types ============

export type AssessmentStatus = 'draft' | 'in_review' | 'completed' | 'delivered';
export type PortabilityRating = 'poor' | 'fair' | 'good' | 'excellent';
export type ServiceType = 'portable' | 'cloud_native' | 'proprietary';
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RecommendationPriority = 'low' | 'medium' | 'high' | 'critical';
export type RecommendationCategory =
  | 'portability'
  | 'architecture'
  | 'service_substitution'
  | 'data'
  | 'devops'
  | 'governance'
  | 'observability'
  | 'security'
  | 'cost'
  | 'migration';

export interface Assessment {
  id: string;
  name: string;
  organizationName: string;
  projectName: string;
  status: AssessmentStatus;
  intakeId?: string;
  intake?: { id: string; organizationName: string; applicationName: string };
  portabilityScore?: PortabilityScore;
  _count?: { recommendations: number; reports: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface PortabilityScore {
  id: string;
  assessmentId: string;
  overallScore: number;
  rating: PortabilityRating;
  modelVersion: string;
  calculatedAt: Date;
  dimensions: ScoreDimension[];
  deductions: ScoreDeduction[];
}

export interface ScoreDimension {
  name: string;
  weight: number;
  rawScore: number;
  weightedScore: number;
}

export interface ScoreDeduction {
  category: string;
  description: string;
  impact: number;
  severity: RiskSeverity;
  provider?: string;
  service?: string;
}

export interface CloudService {
  id: string;
  name: string;
  provider: string;
  category: string;
  type: ServiceType;
  equivalents: string[];
}

export interface LockInRisk {
  id: string;
  service: string;
  provider: string;
  description: string;
  severity: RiskSeverity;
  recommendation?: string;
}

export interface ProviderSummary {
  provider: string;
  serviceCount: number;
  proprietaryServices: number;
  portabilityRiskLevel: 'low' | 'medium' | 'high';
}

export interface PortabilityInventory {
  id: string;
  assessmentId: string;
  providerSummaries: ProviderSummary[];
  services: CloudService[];
  lockInRisks: LockInRisk[];
  createdAt: Date;
}

export interface Recommendation {
  id: string;
  assessmentId: string;
  title: string;
  description: string;
  category: string;
  priority: RecommendationPriority;
  impact: string;
  effort: string;
  rationale: string;
  implementationGuidance: string;
  relatedRisks: string[];
  relatedServices: string[];
  createdAt: Date;
}

export interface AdvisoryReport {
  id: string;
  assessmentId: string;
  title: string;
  organizationName: string;
  generatedAt: Date;
  format: string;
  version: string;
  content: string;
  metadata: {
    portabilityScore?: number;
    riskCount?: number;
    recommendationCount?: number;
    providers?: string[];
  };
}
