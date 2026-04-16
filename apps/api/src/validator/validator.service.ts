import { Injectable } from '@nestjs/common';

export interface ValidationIssue {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  location?: string;
  recommendation?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  metadata?: Record<string, unknown>;
}

interface ManifestPayload {
  application?: string;
  providers?: Record<string, unknown>;
  portability?: Record<string, unknown>;
  [key: string]: unknown;
}

interface PatternPayload {
  id?: string;
  name?: string;
  category?: string;
  description?: string;
  portability?: string;
  version?: string;
  [key: string]: unknown;
}

interface BlueprintPayload {
  provider?: string;
  modules?: unknown[];
  [key: string]: unknown;
}

const VALIDATION_RULES = [
  {
    id: 'OSV-001',
    description: 'Manifest must specify at least one provider',
    severity: 'error' as const,
    category: 'manifest',
    check: (payload: ManifestPayload) =>
      !payload.providers || Object.keys(payload.providers).length === 0,
    message: 'Manifest must specify at least one cloud provider.',
    recommendation: 'Add a "providers" key with AWS, GCP, or Azure configuration.',
  },
  {
    id: 'OSV-002',
    description: 'Patterns must include portability metadata',
    severity: 'error' as const,
    category: 'pattern',
    check: (payload: PatternPayload) => !payload.portability,
    message: 'Pattern must include portability metadata.',
    recommendation: 'Add a "portability" field with value high, medium, or low.',
  },
  {
    id: 'OSV-003',
    description: 'Blueprint must specify a provider',
    severity: 'error' as const,
    category: 'blueprint',
    check: (payload: BlueprintPayload) => !payload.provider,
    message: 'Terraform blueprint must specify a cloud provider.',
    recommendation: 'Add a "provider" field to the blueprint.',
  },
  {
    id: 'OSV-004',
    description: 'Proprietary services must include portability warnings',
    severity: 'warning' as const,
    category: 'manifest',
    check: (payload: ManifestPayload) => {
      const portability = payload.portability ?? {};
      return Object.values(portability).some((v) => v === 'cloud-native');
    },
    message: 'Manifest uses cloud-native (non-portable) services.',
    recommendation: 'Consider replacing cloud-native services with portable alternatives.',
  },
  {
    id: 'OSV-005',
    description: 'Pattern must include a name and description',
    severity: 'error' as const,
    category: 'pattern',
    check: (payload: PatternPayload) => !payload.name || !payload.description,
    message: 'Pattern must include both a name and a description.',
    recommendation: 'Provide "name" and "description" fields in the pattern definition.',
  },
];

@Injectable()
export class ValidatorService {
  validate(artifactType: string, payload: unknown): ValidationResult {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    const applicableRules = VALIDATION_RULES.filter(
      (r) => r.category === artifactType || artifactType === 'adapter' || artifactType === 'policy',
    );

    for (const rule of applicableRules) {
      if (rule.check(payload as any)) {
        const issue: ValidationIssue = {
          code: rule.id,
          message: rule.message,
          severity: rule.severity,
          recommendation: rule.recommendation,
        };
        if (rule.severity === 'error') {
          errors.push(issue);
        } else {
          warnings.push(issue);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: { artifactType, rulesChecked: applicableRules.length },
    };
  }

  listRules() {
    return VALIDATION_RULES.map(({ id, description, severity, category }) => ({
      id,
      description,
      severity,
      category,
    }));
  }
}
