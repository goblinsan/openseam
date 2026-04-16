import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { migrationsApi, projectsApi } from '../../api/client';

const pageStyle: React.CSSProperties = { padding: 32 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const thStyle: React.CSSProperties = { background: '#f8fafc', padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' };
const tdStyle: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14 };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' };
const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 };

const statusColors: Record<string, React.CSSProperties> = {
  pending: { background: '#f1f5f9', color: '#475569' },
  analyzing: { background: '#dbeafe', color: '#1e40af' },
  completed: { background: '#d1fae5', color: '#065f46' },
};

const complexityColors: Record<string, React.CSSProperties> = {
  low: { background: '#d1fae5', color: '#065f46' },
  medium: { background: '#fef3c7', color: '#92400e' },
  high: { background: '#fee2e2', color: '#991b1b' },
  critical: { background: '#fdf2f8', color: '#9d174d' },
};

const PROVIDERS = ['aws', 'azure', 'gcp', 'onprem'];

interface MigrationReport {
  estimatedCost: number;
  estimatedDurationWeeks: number;
  complexity: string;
  riskLevel: string;
}

interface MigrationScenario {
  id: string;
  projectId: string;
  sourceProvider: string;
  targetProvider: string;
  status: string;
  createdAt: string;
  report: MigrationReport | null;
}

interface Project {
  id: string;
  name: string;
}

export default function MigrationsPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ projectId: '', sourceProvider: 'aws', targetProvider: 'gcp' });
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: scenarios = [], isLoading } = useQuery<MigrationScenario[]>({
    queryKey: ['migrations'],
    queryFn: () => migrationsApi.list(),
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => migrationsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['migrations'] });
      setShowModal(false);
      setForm({ projectId: '', sourceProvider: 'aws', targetProvider: 'gcp' });
    },
  });

  const simulateMutation = useMutation({
    mutationFn: (id: string) => migrationsApi.simulate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['migrations'] }),
  });

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Migration Simulator</h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>Simulate cross-cloud migrations and evaluate risk, cost, and portability</p>
        </div>
        <button style={btnStyle} onClick={() => setShowModal(true)}>+ New Scenario</button>
      </div>

      {isLoading ? <div>Loading...</div> : (
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Project', 'Source', 'Target', 'Status', 'Complexity', 'Risk', 'Est. Cost', 'Duration (wks)', 'Actions'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenarios.length === 0 ? (
              <tr><td colSpan={9} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8' }}>No scenarios yet. Create your first migration simulation.</td></tr>
            ) : scenarios.map((s) => {
              const project = projects.find((p) => p.id === s.projectId);
              const statusStyle = statusColors[s.status] ?? statusColors.pending;
              const complexityStyle = s.report ? complexityColors[s.report.complexity] ?? complexityColors.medium : null;
              return (
                <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/migrations/${s.id}`)}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{project?.name ?? '—'}</td>
                  <td style={{ ...tdStyle, textTransform: 'uppercase', fontSize: 12, fontWeight: 600, color: '#f97316' }}>{s.sourceProvider}</td>
                  <td style={{ ...tdStyle, textTransform: 'uppercase', fontSize: 12, fontWeight: 600, color: '#8b5cf6' }}>{s.targetProvider}</td>
                  <td style={tdStyle}>
                    <span style={{ ...statusStyle, borderRadius: 4, padding: '2px 10px', fontSize: 12 }}>{s.status}</span>
                  </td>
                  <td style={tdStyle}>
                    {s.report && complexityStyle ? (
                      <span style={{ ...complexityStyle, borderRadius: 4, padding: '2px 10px', fontSize: 12 }}>{s.report.complexity}</span>
                    ) : '—'}
                  </td>
                  <td style={tdStyle}>
                    {s.report ? (
                      <span style={{ ...complexityColors[s.report.riskLevel] ?? complexityColors.medium, borderRadius: 4, padding: '2px 10px', fontSize: 12 }}>{s.report.riskLevel}</span>
                    ) : '—'}
                  </td>
                  <td style={tdStyle}>{s.report ? `$${s.report.estimatedCost.toLocaleString()}` : '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{s.report?.estimatedDurationWeeks ?? '—'}</td>
                  <td style={tdStyle} onClick={e => e.stopPropagation()}>
                    {s.status === 'pending' && (
                      <button
                        onClick={() => simulateMutation.mutate(s.id)}
                        style={{ ...btnStyle, fontSize: 12, padding: '4px 10px', background: '#7c3aed' }}
                        disabled={simulateMutation.isPending}
                      >
                        {simulateMutation.isPending ? 'Running...' : '▶ Simulate'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Migration Scenario</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Project *</label>
              <select style={inputStyle} value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
                <option value="">— Select project —</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Source Provider *</label>
              <select style={inputStyle} value={form.sourceProvider} onChange={e => setForm(f => ({ ...f, sourceProvider: e.target.value }))}>
                {PROVIDERS.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Target Provider *</label>
              <select style={inputStyle} value={form.targetProvider} onChange={e => setForm(f => ({ ...f, targetProvider: e.target.value }))}>
                {PROVIDERS.filter((p) => p !== 'onprem').map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ ...btnStyle, background: '#64748b' }}>Cancel</button>
              <button
                onClick={() => createMutation.mutate(form)}
                style={btnStyle}
                disabled={!form.projectId || form.sourceProvider === form.targetProvider || createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
