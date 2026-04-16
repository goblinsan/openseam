import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { impactsApi, projectsApi } from '../../api/client';

const pageStyle: React.CSSProperties = { padding: 32 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const thStyle: React.CSSProperties = { background: '#f8fafc', padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' };
const tdStyle: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14 };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' };
const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 };

const riskColors: Record<string, React.CSSProperties> = {
  critical: { background: '#fee2e2', color: '#991b1b' },
  high: { background: '#fef3c7', color: '#92400e' },
  medium: { background: '#dbeafe', color: '#1e40af' },
  low: { background: '#d1fae5', color: '#065f46' },
};

interface ImpactReport {
  id: string;
  projectId: string;
  artifactType: string;
  summary: { changeType: string; overallRisk: string; portabilityScoreDelta?: number; affectedResources: number };
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
}

export default function ImpactsPage() {
  const [showModal, setShowModal] = useState(false);
  const [projectFilter, setProjectFilter] = useState('');
  const [form, setForm] = useState({ projectId: '', artifactType: 'manifest', after: '{}' });
  const qc = useQueryClient();

  const { data: reports = [], isLoading } = useQuery<ImpactReport[]>({
    queryKey: ['impacts', projectFilter],
    queryFn: () => impactsApi.list(projectFilter ? { projectId: projectFilter } : undefined),
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(),
  });

  const analyzeMutation = useMutation({
    mutationFn: (data: unknown) => impactsApi.analyze(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['impacts'] });
      setShowModal(false);
      setForm({ projectId: '', artifactType: 'manifest', after: '{}' });
    },
  });

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Change Impact Analyzer</h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>Analyze proposed changes for portability and risk impacts</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select style={{ ...inputStyle, width: 200 }} value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
            <option value="">All Projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button style={btnStyle} onClick={() => setShowModal(true)}>+ Analyze Change</button>
        </div>
      </div>

      {isLoading ? <div>Loading...</div> : (
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Project', 'Artifact Type', 'Change Type', 'Overall Risk', 'Score Delta', 'Affected Resources', 'Date'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8' }}>No impact reports yet. Analyze your first change.</td></tr>
            ) : reports.map((r) => {
              const project = projects.find((p) => p.id === r.projectId);
              const riskStyle = riskColors[r.summary?.overallRisk] ?? riskColors.low;
              return (
                <tr key={r.id}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{project?.name ?? '—'}</td>
                  <td style={tdStyle}>{r.artifactType}</td>
                  <td style={tdStyle}>{r.summary?.changeType ?? '—'}</td>
                  <td style={tdStyle}>
                    <span style={{ ...riskStyle, borderRadius: 4, padding: '2px 10px', fontSize: 12 }}>{r.summary?.overallRisk ?? '—'}</span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: (r.summary?.portabilityScoreDelta ?? 0) < 0 ? '#dc2626' : '#16a34a' }}>
                    {r.summary?.portabilityScoreDelta !== undefined ? `${r.summary.portabilityScoreDelta > 0 ? '+' : ''}${r.summary.portabilityScoreDelta}` : '—'}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{r.summary?.affectedResources ?? 0}</td>
                  <td style={tdStyle}>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Analyze Change Impact</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Project *</label>
              <select style={inputStyle} value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
                <option value="">— Select project —</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Artifact Type *</label>
              <select style={inputStyle} value={form.artifactType} onChange={e => setForm(f => ({ ...f, artifactType: e.target.value }))}>
                <option value="manifest">Manifest</option>
                <option value="blueprint">Blueprint</option>
                <option value="pattern">Pattern</option>
                <option value="policy">Policy</option>
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Artifact JSON (after change)</label>
              <textarea
                style={{ ...inputStyle, height: 120, fontFamily: 'monospace', fontSize: 13, resize: 'vertical' }}
                value={form.after}
                onChange={e => setForm(f => ({ ...f, after: e.target.value }))}
                placeholder='{"providers": {"aws": {}}, "proprietary": false}'
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ ...btnStyle, background: '#64748b' }}>Cancel</button>
              <button
                onClick={() => {
                  let parsed: unknown = {};
                  try { parsed = JSON.parse(form.after); } catch { parsed = {}; }
                  analyzeMutation.mutate({ projectId: form.projectId, artifactType: form.artifactType, after: parsed });
                }}
                style={btnStyle}
                disabled={!form.projectId || analyzeMutation.isPending}
              >
                {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
