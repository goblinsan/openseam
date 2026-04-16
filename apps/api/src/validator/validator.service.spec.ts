import { Test, TestingModule } from '@nestjs/testing';
import { ValidatorService } from './validator.service';

describe('ValidatorService', () => {
  let service: ValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidatorService],
    }).compile();
    service = module.get<ValidatorService>(ValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('validate() returns valid result for a correct manifest', () => {
    const result = service.validate('manifest', {
      application: 'invoice-service',
      providers: { aws: { storage: 's3' } },
      portability: { storage: 'portable' },
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validate() returns error OSV-001 when manifest has no providers', () => {
    const result = service.validate('manifest', { application: 'invoice-service' });
    expect(result.valid).toBe(false);
    const codes = result.errors.map((e) => e.code);
    expect(codes).toContain('OSV-001');
  });

  it('validate() returns warning OSV-004 when manifest uses cloud-native services', () => {
    const result = service.validate('manifest', {
      application: 'invoice-service',
      providers: { aws: { compute: 'lambda' } },
      portability: { compute: 'cloud-native' },
    });
    const codes = result.warnings.map((w) => w.code);
    expect(codes).toContain('OSV-004');
  });

  it('validate() returns error OSV-002 when pattern lacks portability', () => {
    const result = service.validate('pattern', {
      id: 'api-service',
      name: 'API Service',
      description: 'A REST API pattern',
    });
    expect(result.valid).toBe(false);
    const codes = result.errors.map((e) => e.code);
    expect(codes).toContain('OSV-002');
  });

  it('validate() returns valid for a complete pattern', () => {
    const result = service.validate('pattern', {
      id: 'api-service',
      name: 'API Service',
      description: 'A REST API pattern',
      portability: 'high',
      version: '1.0.0',
    });
    expect(result.valid).toBe(true);
  });

  it('listRules() returns all rules', () => {
    const rules = service.listRules();
    expect(rules.length).toBeGreaterThanOrEqual(5);
    expect(rules[0]).toHaveProperty('id');
    expect(rules[0]).toHaveProperty('description');
  });
});
