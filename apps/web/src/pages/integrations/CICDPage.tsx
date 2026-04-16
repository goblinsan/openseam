import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationsApi, projectsApi } from '../../api/client';

const pageStyle: React.CSSProperties = { padding: 32 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const thStyle: React.CSSProperties = { background: '#f8fafc', padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' };
const tdStyle: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14 };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' };
const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 };

const providerColors: Record<string, React.CSSProperties> = {
  github: { background: '#dbeafe', color: '#1e40af' },
  gitlab: { background: '#fce7f3', color: '#9d174d' },
  azure_devops: { background: '#ede9fe', color: '#5b21b6' },
  jenkins: { background: '#fef3c7', color: '#92400e' },
};

interface Integration {
  id: string;
  projectId: string;
  provider: string;
  repositoryUrl: string;
  defaultBranch: string;
  createdAt: string;
  _count?: { pipelineRuns: number; prChecks: number };
}

interface Project {
  id: string;
  name: string;
}

export default function CICDPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ projectId: '', repositoryUrl: '', provider: 'github', defaultBranch: 'main' });
  const qc = useQueryClient();

  const { data: integrations = [], isLoading } = useQuery<Integration[]>({
    queryKey: ['integrations'],
    queryFn: () => integrationsApi.list(),
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => integrationsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['integrations'] });
      setShowModal(false);
      setForm({ projectId: '', repositoryUrl: '', provider: 'github', defaultBranch: 'main' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => integrationsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['integrations'] }),
  });

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>CI/CD Integrations</h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>Connect repositories and manage pipeline integrations</p>
        </div>
        <button style={btnStyle} onClick={() => setShowModal(true)}>+ New Integration</button>
      </div>

      {isLoading ? <div>Loading...</div> : (
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Repository', 'Provider', 'Branch', 'Project', 'Pipeline Runs', 'PR Checks', 'Created', 'Actions'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {integrations.length === 0 ? (
              <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8' }}>No integrations yet. Connect your first repository.</td></tr>
            ) : integrations.map((i) => {
              const project = projects.find((p) => p.id === i.projectId);
              const providerStyle = providerColors[i.provider] ?? { background: '#f1f5f9', color: '#475569' };
              return (
                <tr key={i.id}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#1e40af', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.repositoryUrl}</td>
                  <td style={tdStyle}>
                    <span style={{ ...providerStyle, borderRadius: 4, padding: '2px 10px', fontSize: 12 }}>{i.provider}</span>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 13 }}>{i.defaultBranch}</td>
                  <td style={tdStyle}>{project?.name ?? '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{i._count?.pipelineRuns ?? 0}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{i._count?.prChecks ?? 0}</td>
                  <td style={tdStyle}>{new Date(i.createdAt).toLocaleDateString()}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => deleteMutation.mutate(i.id)}
                      style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}
                    >Remove</button>
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
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New CI/CD Integration</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Project *</label>
              <select style={inputStyle} value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
                <option value="">— Select project —</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Repository URL *</label>
              <input style={inputStyle} value={form.repositoryUrl} onChange={e => setForm(f => ({ ...f, repositoryUrl: e.target.value }))} placeholder="https://github.com/org/repo" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Provider</label>
              <select style={inputStyle} value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}>
                <option value="github">GitHub</option>
                <option value="gitlab">GitLab</option>
                <option value="azure_devops">Azure DevOps</option>
                <option value="jenkins">Jenkins</option>
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Default Branch</label>
              <input style={inputStyle} value={form.defaultBranch} onChange={e => setForm(f => ({ ...f, defaultBranch: e.target.value }))} placeholder="main" />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ ...btnStyle, background: '#64748b' }}>Cancel</button>
              <button
                onClick={() => createMutation.mutate(form)}
                style={btnStyle}
                disabled={!form.projectId || !form.repositoryUrl || createMutation.isPending}
              >
                {createMutation.isPending ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
