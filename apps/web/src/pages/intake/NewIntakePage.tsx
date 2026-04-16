import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { intakeApi } from '../../api/client';

const STEPS = ['Organization', 'Cloud & Environment', 'Compute & Storage', 'Messaging & Identity', 'CI/CD & Observability', 'Review'];
const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%' };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 14, fontWeight: 500 };

const CLOUD_PROVIDERS = ['aws', 'azure', 'gcp', 'other'];

export default function NewIntakePage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    organizationName: '',
    applicationName: '',
    description: '',
    primaryContact: '',
    cloudProviders: [] as string[],
    environments: '',
    compute: { services: '', orchestration: '' },
    storage: { databases: '', objectStorage: '' },
    messaging: { queues: '', streams: '' },
    identity: { providers: '' },
    cicd: { tools: '' },
    observability: { logging: '', monitoring: '', tracing: '' },
    security: { tools: '' },
    compliance: '',
    portabilityGoals: '',
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => intakeApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['intakes'] }); navigate('/intake'); },
  });

  const set = (path: string, value: unknown) => {
    const [top, sub] = path.split('.');
    setForm(f => {
      if (!sub) return { ...f, [top]: value };
      return { ...f, [top]: { ...(f as Record<string, unknown>)[top] as object, [sub]: value } };
    });
  };

  const toggleCloud = (provider: string) => {
    setForm(f => ({
      ...f,
      cloudProviders: f.cloudProviders.includes(provider)
        ? f.cloudProviders.filter(p => p !== provider)
        : [...f.cloudProviders, provider],
    }));
  };

  const handleSubmit = () => {
    const payload = {
      organizationName: form.organizationName,
      applicationName: form.applicationName,
      description: form.description,
      primaryContact: form.primaryContact,
      cloudProviders: form.cloudProviders,
      environments: form.environments.split(',').map(e => e.trim()).filter(Boolean),
      compute: { services: form.compute.services.split(',').map(s => s.trim()).filter(Boolean), orchestration: form.compute.orchestration },
      storage: { databases: form.storage.databases.split(',').map(s => s.trim()).filter(Boolean), objectStorage: form.storage.objectStorage.split(',').map(s => s.trim()).filter(Boolean) },
      messaging: { queues: form.messaging.queues.split(',').map(s => s.trim()).filter(Boolean), streams: form.messaging.streams.split(',').map(s => s.trim()).filter(Boolean) },
      identity: { providers: form.identity.providers.split(',').map(s => s.trim()).filter(Boolean) },
      cicd: { tools: form.cicd.tools.split(',').map(s => s.trim()).filter(Boolean) },
      observability: { logging: form.observability.logging.split(',').map(s => s.trim()).filter(Boolean), monitoring: form.observability.monitoring.split(',').map(s => s.trim()).filter(Boolean), tracing: form.observability.tracing.split(',').map(s => s.trim()).filter(Boolean) },
      security: { tools: form.security.tools.split(',').map(s => s.trim()).filter(Boolean) },
      compliance: form.compliance.split(',').map(s => s.trim()).filter(Boolean),
      portabilityGoals: form.portabilityGoals,
    };
    createMutation.mutate(payload);
  };

  const stepContent = [
    // Step 0: Organization
    <div key="org">
      {[
        { path: 'organizationName', label: 'Organization Name' },
        { path: 'applicationName', label: 'Application Name' },
        { path: 'description', label: 'Description' },
        { path: 'primaryContact', label: 'Primary Contact (email)' },
      ].map(({ path, label }) => (
        <div key={path} style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{label}</label>
          <input style={inputStyle} value={(form as any)[path]} onChange={e => set(path, e.target.value)} />
        </div>
      ))}
    </div>,

    // Step 1: Cloud & Environment
    <div key="cloud">
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Cloud Providers</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {CLOUD_PROVIDERS.map(p => (
            <label key={p} style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={form.cloudProviders.includes(p)} onChange={() => toggleCloud(p)} />
              {p.toUpperCase()}
            </label>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Environments (comma-separated, e.g. dev, staging, prod)</label>
        <input style={inputStyle} value={form.environments} onChange={e => set('environments', e.target.value)} placeholder="dev, staging, prod" />
      </div>
    </div>,

    // Step 2: Compute & Storage
    <div key="compute">
      {[
        { path: 'compute.services', label: 'Compute Services (comma-separated)' },
        { path: 'compute.orchestration', label: 'Orchestration (e.g. Kubernetes)' },
        { path: 'storage.databases', label: 'Databases (comma-separated)' },
        { path: 'storage.objectStorage', label: 'Object Storage (comma-separated)' },
      ].map(({ path, label }) => (
        <div key={path} style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{label}</label>
          <input style={inputStyle} value={String((path.split('.').reduce((o, k) => (o as Record<string, unknown>)[k], form as unknown) as string) ?? '')} onChange={e => set(path, e.target.value)} />
        </div>
      ))}
    </div>,

    // Step 3: Messaging & Identity
    <div key="msg">
      {[
        { path: 'messaging.queues', label: 'Message Queues (comma-separated)' },
        { path: 'messaging.streams', label: 'Streaming Platforms (comma-separated)' },
        { path: 'identity.providers', label: 'Identity Providers (comma-separated)' },
      ].map(({ path, label }) => (
        <div key={path} style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{label}</label>
          <input style={inputStyle} value={String((path.split('.').reduce((o, k) => (o as Record<string, unknown>)[k], form as unknown) as string) ?? '')} onChange={e => set(path, e.target.value)} />
        </div>
      ))}
    </div>,

    // Step 4: CI/CD & Observability
    <div key="cicd">
      {[
        { path: 'cicd.tools', label: 'CI/CD Tools (comma-separated)' },
        { path: 'observability.logging', label: 'Logging Tools' },
        { path: 'observability.monitoring', label: 'Monitoring Tools' },
        { path: 'observability.tracing', label: 'Tracing Tools' },
        { path: 'security.tools', label: 'Security Tools' },
        { path: 'compliance', label: 'Compliance Requirements (comma-separated)' },
        { path: 'portabilityGoals', label: 'Portability Goals' },
      ].map(({ path, label }) => {
        const raw = path.split('.').reduce((o, k) => (o as Record<string, unknown>)[k], form as unknown);
        const val = typeof raw === 'string' ? raw : '';
        return (
          <div key={path} style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{label}</label>
            <input style={inputStyle} value={val} onChange={e => set(path, e.target.value)} />
          </div>
        );
      })}
    </div>,

    // Step 5: Review
    <div key="review">
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Review Your Submission</h3>
      <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, fontSize: 13, lineHeight: 1.8 }}>
        <div><strong>Organization:</strong> {form.organizationName}</div>
        <div><strong>Application:</strong> {form.applicationName}</div>
        <div><strong>Contact:</strong> {form.primaryContact}</div>
        <div><strong>Cloud:</strong> {form.cloudProviders.join(', ')}</div>
        <div><strong>Environments:</strong> {form.environments}</div>
        <div><strong>Compute:</strong> {form.compute.services}</div>
        <div><strong>Databases:</strong> {form.storage.databases}</div>
      </div>
    </div>,
  ];

  return (
    <div style={{ padding: 32, maxWidth: 700 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>New Architecture Intake</h1>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 32 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= step ? '#3b82f6' : '#e2e8f0',
            transition: 'background 0.2s',
          }} />
        ))}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 20 }}>
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </div>

      <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 20 }}>
        {stepContent[step]}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          style={{ ...btnStyle, background: '#64748b', opacity: step === 0 ? 0.5 : 1 }}
        >
          ← Back
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} style={btnStyle}>Next →</button>
        ) : (
          <button onClick={handleSubmit} style={{ ...btnStyle, background: '#10b981' }} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Saving...' : '✓ Save as Draft'}
          </button>
        )}
      </div>
    </div>
  );
}
