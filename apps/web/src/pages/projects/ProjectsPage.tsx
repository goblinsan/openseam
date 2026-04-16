import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, workspacesApi } from '../../api/client';

const pageStyle: React.CSSProperties = { padding: 32 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const thStyle: React.CSSProperties = { background: '#f8fafc', padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' };
const tdStyle: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14 };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' };
const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 };

interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  repositoryUrl?: string;
  status: string;
  createdAt: string;
  _count?: { environments: number; artifacts: number };
}

interface Workspace {
  id: string;
  name: string;
}

export default function ProjectsPage() {
  const [showModal, setShowModal] = useState(false);
  const [workspaceFilter, setWorkspaceFilter] = useState('');
  const [form, setForm] = useState({ workspaceId: '', name: '', description: '', repositoryUrl: '' });
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['projects', workspaceFilter],
    queryFn: () => projectsApi.list(workspaceFilter ? { workspaceId: workspaceFilter } : undefined),
  });

  const { data: workspaces = [] } = useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: workspacesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => projectsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      setShowModal(false);
      setForm({ workspaceId: '', name: '', description: '', repositoryUrl: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Projects</h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>Manage application projects and environments</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select
            style={{ ...inputStyle, width: 200 }}
            value={workspaceFilter}
            onChange={(e) => setWorkspaceFilter(e.target.value)}
          >
            <option value="">All Workspaces</option>
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <button style={btnStyle} onClick={() => setShowModal(true)}>+ New Project</button>
        </div>
      </div>

      {isLoading ? <div>Loading...</div> : (
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Name', 'Workspace', 'Description', 'Status', 'Environments', 'Artifacts', 'Created', 'Actions'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8' }}>No projects yet. Create your first one.</td></tr>
            ) : projects.map((p) => {
              const ws = workspaces.find((w) => w.id === p.workspaceId);
              return (
                <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${p.id}`)}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#1e40af' }}>{p.name}</td>
                  <td style={{ ...tdStyle, fontSize: 13, color: '#475569' }}>{ws?.name ?? '—'}</td>
                  <td style={{ ...tdStyle, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description ?? '—'}</td>
                  <td style={tdStyle}>
                    <span style={{
                      background: p.status === 'active' ? '#d1fae5' : '#f1f5f9',
                      color: p.status === 'active' ? '#065f46' : '#475569',
                      borderRadius: 4, padding: '2px 10px', fontSize: 12,
                    }}>{p.status}</span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{p._count?.environments ?? 0}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{p._count?.artifacts ?? 0}</td>
                  <td style={tdStyle}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => deleteMutation.mutate(p.id)}
                      style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}
                    >Delete</button>
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
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Project</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Workspace *</label>
              <select style={inputStyle} value={form.workspaceId} onChange={e => setForm(f => ({ ...f, workspaceId: e.target.value }))}>
                <option value="">— Select workspace —</option>
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Project Name *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Invoice Service" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Description</label>
              <input style={inputStyle} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Repository URL</label>
              <input style={inputStyle} value={form.repositoryUrl} onChange={e => setForm(f => ({ ...f, repositoryUrl: e.target.value }))} placeholder="https://github.com/org/repo" />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ ...btnStyle, background: '#64748b' }}>Cancel</button>
              <button
                onClick={() => createMutation.mutate({
                  workspaceId: form.workspaceId,
                  name: form.name,
                  description: form.description || undefined,
                  repositoryUrl: form.repositoryUrl || undefined,
                })}
                style={btnStyle}
                disabled={!form.workspaceId || !form.name || createMutation.isPending}
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
