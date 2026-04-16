import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface RecommendationRule {
  condition: (inventory: any, score: any) => boolean;
  title: string;
  description: string;
  category: string;
  priority: string;
  impact: string;
  effort: string;
  rationale: string;
  implementationGuidance: string;
  relatedServices: string[];
}

const RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    condition: (inv) => inv.lockInRisks?.some((r: any) => r.service?.toLowerCase().includes('dynamodb')),
    title: 'Replace DynamoDB with Portable Data Layer',
    description: "DynamoDB's proprietary API creates significant vendor lock-in. Introduce a portable data access layer.",
    category: 'service_substitution',
    priority: 'high',
    impact: 'high',
    effort: 'high',
    rationale: 'DynamoDB has no cross-cloud equivalent API, making migration complex and costly.',
    implementationGuidance: 'Introduce a repository pattern abstracting data access. Consider PostgreSQL with JSONB for document-like data, or MongoDB Atlas for multi-cloud NoSQL.',
    relatedServices: ['DynamoDB'],
  },
  {
    condition: (inv) => inv.lockInRisks?.some((r: any) => r.service?.toLowerCase().includes('lambda') || r.service?.toLowerCase().includes('functions')),
    title: 'Migrate Serverless Functions to Container-Based Workloads',
    description: 'Serverless functions create provider-specific event trigger dependencies. Migrate to containerized services for portability.',
    category: 'architecture',
    priority: 'medium',
    impact: 'high',
    effort: 'medium',
    rationale: 'Serverless event triggers are provider-specific, creating tight coupling and migration overhead.',
    implementationGuidance: 'Containerize function logic using Docker. Deploy to Kubernetes or Cloud Run. Use an event broker like Kafka or NATS for decoupled event handling.',
    relatedServices: ['Lambda', 'Cloud Functions', 'Azure Functions'],
  },
  {
    condition: (inv) => inv.lockInRisks?.some((r: any) => r.service?.toLowerCase().includes('iam') || r.category === 'Identity & Access'),
    title: 'Externalize Identity with OpenID Connect',
    description: 'Provider-specific IAM creates identity portability risks. Adopt an external identity provider.',
    category: 'security',
    priority: 'high',
    impact: 'medium',
    effort: 'medium',
    rationale: 'Cloud-native IAM policies are not portable and prevent multi-cloud flexibility.',
    implementationGuidance: 'Implement OpenID Connect (OIDC) using Auth0, Keycloak, or Okta. Map cloud resources to external identity claims. Use Workload Identity Federation for service-to-service auth.',
    relatedServices: ['AWS IAM', 'GCP IAM', 'Azure AD'],
  },
  {
    condition: (inv) => inv.lockInRisks?.some((r: any) => ['sqs', 'pub/sub', 'service bus'].some(n => r.service?.toLowerCase().includes(n))),
    title: 'Implement Portable Event Streaming with Kafka or NATS',
    description: 'Proprietary messaging services create integration lock-in. Adopt open-source messaging middleware.',
    category: 'architecture',
    priority: 'medium',
    impact: 'medium',
    effort: 'medium',
    rationale: 'Cloud-native messaging APIs are incompatible across providers, complicating multi-cloud architectures.',
    implementationGuidance: 'Adopt Apache Kafka or NATS for portable event streaming. Use Kafka connectors to bridge existing cloud queues during migration. Consider Confluent Cloud for managed Kafka.',
    relatedServices: ['SQS', 'Pub/Sub', 'Service Bus'],
  },
  {
    condition: (inv, score) => score && score.overallScore < 60,
    title: 'Adopt Infrastructure as Code for Repeatable Deployments',
    description: 'Low portability scores often indicate manual or provider-specific infrastructure management.',
    category: 'devops',
    priority: 'medium',
    impact: 'high',
    effort: 'medium',
    rationale: 'Infrastructure as Code (IaC) using Terraform or OpenTofu enables reproducible, provider-agnostic infrastructure management.',
    implementationGuidance: 'Adopt Terraform or OpenTofu for all infrastructure provisioning. Use provider-agnostic abstractions where possible. Implement Terragrunt for environment management.',
    relatedServices: [],
  },
  {
    condition: (inv) => !inv.services?.some((s: any) => s.category === 'Observability' && s.type === 'portable'),
    title: 'Implement OpenTelemetry for Vendor-Neutral Observability',
    description: 'Provider-specific observability tools create operational lock-in. Adopt OpenTelemetry for portable metrics, logs, and traces.',
    category: 'observability',
    priority: 'low',
    impact: 'medium',
    effort: 'low',
    rationale: 'Cloud-native monitoring tools use proprietary formats that cannot be easily migrated. OpenTelemetry provides a vendor-neutral standard.',
    implementationGuidance: 'Instrument applications with OpenTelemetry SDKs. Deploy an OpenTelemetry Collector. Route telemetry to a portable backend like Grafana, Jaeger, or Victoria Metrics.',
    relatedServices: ['CloudWatch', 'Cloud Monitoring', 'Azure Monitor'],
  },
  {
    condition: (inv) => !inv.services?.some((s: any) => ['Infrastructure as Code', 'Containerization'].includes(s.category) && s.type === 'portable'),
    title: 'Adopt Container-Based Deployment Strategy',
    description: 'Containerizing workloads significantly improves portability across cloud providers.',
    category: 'migration',
    priority: 'high',
    impact: 'high',
    effort: 'high',
    rationale: 'Containers provide a portable application packaging model that runs consistently across all cloud providers and on-premises environments.',
    implementationGuidance: 'Containerize all application components using Docker. Define Kubernetes manifests (Helm charts) for deployment. Use a GitOps workflow with ArgoCD or Flux for continuous deployment.',
    relatedServices: [],
  },
  {
    condition: (inv, score) => score && score.overallScore >= 60 && score.overallScore < 80,
    title: 'Establish Multi-Cloud Governance Framework',
    description: 'With good portability scores, establishing governance ensures sustainable multi-cloud operations.',
    category: 'governance',
    priority: 'medium',
    impact: 'medium',
    effort: 'medium',
    rationale: 'Governance frameworks ensure portability improvements are maintained and new vendor dependencies are evaluated before adoption.',
    implementationGuidance: 'Define cloud service selection criteria. Implement a cloud-neutral architecture review board. Establish FinOps practices. Use cloud management platforms like Crossplane or Pulumi for policy enforcement.',
    relatedServices: [],
  },
];

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  async generate(assessmentId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        inventory: { include: { services: true, lockInRisks: true } },
        portabilityScore: true,
      },
    });

    if (!assessment) throw new Error(`Assessment ${assessmentId} not found`);

    const inventory = assessment.inventory;
    const score = assessment.portabilityScore;

    // Delete existing recommendations
    await this.prisma.recommendation.deleteMany({ where: { assessmentId } });

    const applicable = RECOMMENDATION_RULES.filter((rule) => rule.condition(inventory ?? {}, score));

    const recommendations = applicable.map((rule) => ({
      assessmentId,
      title: rule.title,
      description: rule.description,
      category: rule.category,
      priority: rule.priority,
      impact: rule.impact,
      effort: rule.effort,
      rationale: rule.rationale,
      implementationGuidance: rule.implementationGuidance,
      relatedServices: rule.relatedServices,
      relatedRisks: [] as string[],
    }));

    await this.prisma.recommendation.createMany({ data: recommendations });

    return this.prisma.recommendation.findMany({ where: { assessmentId }, orderBy: { priority: 'desc' } });
  }

  findByAssessment(assessmentId: string) {
    return this.prisma.recommendation.findMany({
      where: { assessmentId },
      orderBy: { priority: 'desc' },
    });
  }
}
