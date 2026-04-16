import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ServiceRule {
  names: string[];
  provider: string;
  category: string;
  type: 'portable' | 'cloud_native' | 'proprietary';
  equivalents: string[];
  lockInSeverity?: 'low' | 'medium' | 'high' | 'critical';
  lockInDescription?: string;
  recommendation?: string;
}

const SERVICE_RULES: ServiceRule[] = [
  // Object Storage
  { names: ['s3', 'amazon s3'], provider: 'aws', category: 'Object Storage', type: 'portable', equivalents: ['GCS', 'Azure Blob Storage'] },
  { names: ['gcs', 'google cloud storage', 'cloud storage'], provider: 'gcp', category: 'Object Storage', type: 'portable', equivalents: ['S3', 'Azure Blob Storage'] },
  { names: ['azure blob', 'blob storage'], provider: 'azure', category: 'Object Storage', type: 'portable', equivalents: ['S3', 'GCS'] },

  // Managed Kubernetes
  { names: ['eks', 'amazon eks', 'elastic kubernetes service'], provider: 'aws', category: 'Managed Kubernetes', type: 'portable', equivalents: ['GKE', 'AKS'] },
  { names: ['gke', 'google kubernetes engine'], provider: 'gcp', category: 'Managed Kubernetes', type: 'portable', equivalents: ['EKS', 'AKS'] },
  { names: ['aks', 'azure kubernetes service'], provider: 'azure', category: 'Managed Kubernetes', type: 'portable', equivalents: ['EKS', 'GKE'] },

  // Serverless
  { names: ['lambda', 'aws lambda'], provider: 'aws', category: 'Serverless Compute', type: 'cloud_native', equivalents: ['Cloud Functions', 'Azure Functions'], lockInSeverity: 'medium', lockInDescription: 'AWS Lambda uses proprietary event triggers and runtime configurations', recommendation: 'Migrate to container-based workloads (Kubernetes, Cloud Run) for improved portability' },
  { names: ['cloud functions', 'google cloud functions'], provider: 'gcp', category: 'Serverless Compute', type: 'cloud_native', equivalents: ['Lambda', 'Azure Functions'], lockInSeverity: 'medium', lockInDescription: 'GCP Cloud Functions uses proprietary triggers and IAM integration', recommendation: 'Use Cloud Run for container-based portability or abstract behind an API gateway' },
  { names: ['azure functions'], provider: 'azure', category: 'Serverless Compute', type: 'cloud_native', equivalents: ['Lambda', 'Cloud Functions'], lockInSeverity: 'medium', lockInDescription: 'Azure Functions bindings create tight coupling to Azure services', recommendation: 'Containerize business logic and deploy to AKS for improved portability' },

  // NoSQL (Proprietary)
  { names: ['dynamodb', 'amazon dynamodb'], provider: 'aws', category: 'NoSQL Database', type: 'proprietary', equivalents: ['Firestore', 'Cosmos DB', 'MongoDB'], lockInSeverity: 'high', lockInDescription: 'DynamoDB has a proprietary API with no cross-provider equivalents', recommendation: 'Introduce a storage abstraction layer using PostgreSQL or a portable data interface like Fauna' },
  { names: ['firestore', 'google firestore', 'cloud firestore'], provider: 'gcp', category: 'NoSQL Database', type: 'proprietary', equivalents: ['DynamoDB', 'Cosmos DB', 'MongoDB'], lockInSeverity: 'high', lockInDescription: 'Firestore uses a proprietary document model tightly coupled to GCP IAM', recommendation: 'Migrate to MongoDB Atlas or abstract behind a data repository pattern' },
  { names: ['cosmos db', 'azure cosmos'], provider: 'azure', category: 'NoSQL Database', type: 'proprietary', equivalents: ['DynamoDB', 'Firestore', 'MongoDB'], lockInSeverity: 'high', lockInDescription: 'Cosmos DB has proprietary APIs despite multi-model support', recommendation: 'Use PostgreSQL or MongoDB for cross-cloud portability' },

  // Messaging
  { names: ['sqs', 'amazon sqs', 'simple queue service'], provider: 'aws', category: 'Message Queue', type: 'cloud_native', equivalents: ['Cloud Pub/Sub', 'Azure Service Bus', 'Kafka'], lockInSeverity: 'medium', lockInDescription: 'SQS is tightly coupled to AWS IAM and event triggers', recommendation: 'Implement an event-driven architecture using Kafka or NATS for cross-cloud messaging' },
  { names: ['pub/sub', 'google pub/sub', 'cloud pub/sub'], provider: 'gcp', category: 'Message Queue', type: 'cloud_native', equivalents: ['SQS', 'Azure Service Bus', 'Kafka'], lockInSeverity: 'medium', lockInDescription: 'GCP Pub/Sub is tightly integrated with GCP IAM and Cloud Functions', recommendation: 'Consider Apache Kafka or NATS for portable event streaming' },
  { names: ['service bus', 'azure service bus'], provider: 'azure', category: 'Message Queue', type: 'cloud_native', equivalents: ['SQS', 'Cloud Pub/Sub', 'Kafka'], lockInSeverity: 'medium', lockInDescription: 'Azure Service Bus integrates deeply with Azure AD and Logic Apps', recommendation: 'Adopt Kafka or RabbitMQ for portable messaging infrastructure' },

  // Managed SQL
  { names: ['rds', 'amazon rds', 'aurora'], provider: 'aws', category: 'Managed SQL', type: 'portable', equivalents: ['Cloud SQL', 'Azure Database'] },
  { names: ['cloud sql', 'google cloud sql'], provider: 'gcp', category: 'Managed SQL', type: 'portable', equivalents: ['RDS', 'Azure Database'] },
  { names: ['azure database', 'azure sql', 'azure postgresql'], provider: 'azure', category: 'Managed SQL', type: 'portable', equivalents: ['RDS', 'Cloud SQL'] },

  // IAM
  { names: ['iam', 'aws iam', 'identity and access management'], provider: 'aws', category: 'Identity & Access', type: 'proprietary', equivalents: ['GCP IAM', 'Azure AD', 'Auth0'], lockInSeverity: 'high', lockInDescription: 'AWS IAM policies are not portable across cloud providers', recommendation: 'Externalize identity using OpenID Connect, Auth0, or Keycloak' },
  { names: ['gcp iam', 'google iam', 'cloud iam'], provider: 'gcp', category: 'Identity & Access', type: 'proprietary', equivalents: ['AWS IAM', 'Azure AD', 'Auth0'], lockInSeverity: 'high', lockInDescription: 'GCP IAM is tightly coupled to GCP resource hierarchy', recommendation: 'Use Workload Identity Federation or external IdP for cross-cloud portability' },
  { names: ['azure ad', 'azure active directory', 'entra id'], provider: 'azure', category: 'Identity & Access', type: 'cloud_native', equivalents: ['AWS IAM', 'GCP IAM', 'Auth0'], lockInSeverity: 'medium', lockInDescription: 'Azure AD/Entra ID is deeply integrated with Microsoft ecosystem', recommendation: 'Supplement with OpenID Connect for cross-platform identity' },

  // Containers
  { names: ['ecs', 'amazon ecs', 'elastic container service'], provider: 'aws', category: 'Container Orchestration', type: 'cloud_native', equivalents: ['GKE', 'AKS', 'Kubernetes'], lockInSeverity: 'medium', lockInDescription: 'ECS task definitions and IAM task roles are AWS-specific', recommendation: 'Migrate to EKS or containerize on Kubernetes for improved portability' },
  { names: ['fargate', 'aws fargate'], provider: 'aws', category: 'Serverless Containers', type: 'cloud_native', equivalents: ['Cloud Run', 'Azure Container Instances'], lockInSeverity: 'medium', lockInDescription: 'Fargate task definitions create AWS-specific deployment configurations', recommendation: 'Use Kubernetes-native deployments for cross-cloud portability' },
  { names: ['cloud run', 'google cloud run'], provider: 'gcp', category: 'Serverless Containers', type: 'cloud_native', equivalents: ['Fargate', 'Azure Container Instances'], lockInSeverity: 'low', lockInDescription: 'Cloud Run is based on Knative, offering reasonable portability', recommendation: 'Consider Knative on Kubernetes for full portability' },

  // CI/CD
  { names: ['codepipeline', 'aws codepipeline', 'codebuild', 'aws codebuild'], provider: 'aws', category: 'CI/CD', type: 'cloud_native', equivalents: ['Cloud Build', 'Azure DevOps', 'GitHub Actions'], lockInSeverity: 'low', lockInDescription: 'AWS-specific CI/CD tooling creates pipeline migration overhead', recommendation: 'Migrate to GitHub Actions or Tekton for vendor-neutral CI/CD' },
  { names: ['cloud build', 'google cloud build'], provider: 'gcp', category: 'CI/CD', type: 'cloud_native', equivalents: ['CodePipeline', 'Azure DevOps', 'GitHub Actions'], lockInSeverity: 'low', lockInDescription: 'GCP-specific build configuration requires migration effort', recommendation: 'Use GitHub Actions or Cloud-agnostic CI/CD tools' },

  // Terraform (portable)
  { names: ['terraform', 'opentofu'], provider: 'multi', category: 'Infrastructure as Code', type: 'portable', equivalents: [] },
  { names: ['kubernetes', 'k8s'], provider: 'multi', category: 'Container Orchestration', type: 'portable', equivalents: [] },
  { names: ['docker', 'containers'], provider: 'multi', category: 'Containerization', type: 'portable', equivalents: [] },

  // Observability
  { names: ['cloudwatch', 'aws cloudwatch'], provider: 'aws', category: 'Observability', type: 'cloud_native', equivalents: ['Cloud Monitoring', 'Azure Monitor', 'Prometheus'], lockInSeverity: 'low', lockInDescription: 'CloudWatch metrics and log format are AWS-specific', recommendation: 'Adopt OpenTelemetry for vendor-neutral observability' },
  { names: ['cloud monitoring', 'stackdriver', 'google cloud monitoring'], provider: 'gcp', category: 'Observability', type: 'cloud_native', equivalents: ['CloudWatch', 'Azure Monitor', 'Prometheus'], lockInSeverity: 'low', lockInDescription: 'GCP-specific monitoring agents and metrics format', recommendation: 'Implement OpenTelemetry for portable observability' },
];

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  private classifyServices(intakeData: any): { services: any[]; lockInRisks: any[] } {
    const services: any[] = [];
    const lockInRisks: any[] = [];
    const seen = new Set<string>();

    const allServiceNames: string[] = [];

    // Collect all service names from intake data
    if (intakeData?.compute?.services) allServiceNames.push(...intakeData.compute.services);
    if (intakeData?.compute?.orchestration) allServiceNames.push(intakeData.compute.orchestration);
    if (intakeData?.storage?.databases) allServiceNames.push(...intakeData.storage.databases);
    if (intakeData?.storage?.objectStorage) allServiceNames.push(...intakeData.storage.objectStorage);
    if (intakeData?.messaging?.queues) allServiceNames.push(...intakeData.messaging.queues);
    if (intakeData?.messaging?.streams) allServiceNames.push(...intakeData.messaging.streams);
    if (intakeData?.messaging?.pubsub) allServiceNames.push(...intakeData.messaging.pubsub);
    if (intakeData?.identity?.providers) allServiceNames.push(...intakeData.identity.providers);
    if (intakeData?.identity?.iamSystems) allServiceNames.push(...intakeData.identity.iamSystems);
    if (intakeData?.cicd?.tools) allServiceNames.push(...intakeData.cicd.tools);
    if (intakeData?.observability?.logging) allServiceNames.push(...intakeData.observability.logging);
    if (intakeData?.observability?.monitoring) allServiceNames.push(...intakeData.observability.monitoring);
    if (intakeData?.observability?.tracing) allServiceNames.push(...intakeData.observability.tracing);

    for (const serviceName of allServiceNames) {
      const normalized = serviceName.toLowerCase().trim();
      if (seen.has(normalized)) continue;
      seen.add(normalized);

      const rule = SERVICE_RULES.find((r) => r.names.some((n) => normalized.includes(n)));
      if (rule) {
        services.push({
          name: serviceName,
          provider: rule.provider,
          category: rule.category,
          type: rule.type,
          equivalents: rule.equivalents,
        });

        if (rule.lockInSeverity && rule.lockInDescription) {
          lockInRisks.push({
            service: serviceName,
            provider: rule.provider,
            description: rule.lockInDescription,
            severity: rule.lockInSeverity,
            recommendation: rule.recommendation,
          });
        }
      } else {
        // Unknown service - add as portable by default
        services.push({
          name: serviceName,
          provider: 'unknown',
          category: 'Other',
          type: 'portable',
          equivalents: [],
        });
      }
    }

    return { services, lockInRisks };
  }

  private buildProviderSummaries(services: any[], lockInRisks: any[]): any[] {
    const providerMap: Record<string, { serviceCount: number; proprietaryCount: number; risks: string[] }> = {};

    for (const svc of services) {
      if (svc.provider === 'multi' || svc.provider === 'unknown') continue;
      if (!providerMap[svc.provider]) {
        providerMap[svc.provider] = { serviceCount: 0, proprietaryCount: 0, risks: [] };
      }
      providerMap[svc.provider].serviceCount++;
      if (svc.type === 'proprietary') providerMap[svc.provider].proprietaryCount++;
    }

    for (const risk of lockInRisks) {
      if (providerMap[risk.provider]) {
        providerMap[risk.provider].risks.push(risk.severity);
      }
    }

    return Object.entries(providerMap).map(([provider, data]) => {
      const hasCritical = data.risks.includes('critical');
      const hasHigh = data.risks.includes('high');
      const riskLevel = hasCritical ? 'high' : hasHigh ? 'high' : data.risks.length > 0 ? 'medium' : 'low';
      return {
        provider,
        serviceCount: data.serviceCount,
        proprietaryServices: data.proprietaryCount,
        portabilityRiskLevel: riskLevel,
      };
    });
  }

  async generate(assessmentId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { intake: true },
    });

    if (!assessment) throw new Error(`Assessment ${assessmentId} not found`);

    const intakeData = assessment.intake ?? {};
    const { services, lockInRisks } = this.classifyServices(intakeData);
    const providerSummaries = this.buildProviderSummaries(services, lockInRisks);

    // Delete existing inventory if any
    const existing = await this.prisma.portabilityInventory.findUnique({ where: { assessmentId } });
    if (existing) {
      await this.prisma.portabilityInventory.delete({ where: { assessmentId } });
    }

    return this.prisma.portabilityInventory.create({
      data: {
        assessmentId,
        providerSummaries: providerSummaries as any,
        services: { create: services },
        lockInRisks: { create: lockInRisks },
      },
      include: { services: true, lockInRisks: true },
    });
  }

  findOne(assessmentId: string) {
    return this.prisma.portabilityInventory.findUnique({
      where: { assessmentId },
      include: { services: true, lockInRisks: true },
    });
  }
}
