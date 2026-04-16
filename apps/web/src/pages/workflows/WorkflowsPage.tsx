import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowsApi, projectsApi } from '../../api/client';

const pageStyle: React.CSSProperties = { padding: 32 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const thStyle: React.CSSProperties = { background: '#f8fafc', padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' };
const tdStyle: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14 };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' };
const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 };

const statusColors: Record<string, React.CSSProperties> = {
  pending: { background: '#f1f5f9', color: '#475569' },
  in_progress: { background: '#dbeafe', color: '#1e40af' },
  approved: { background: '#d1fae5', color: '#065f46' },
  rejected: { background: '#fee2e2', color: '#991b1b' },
  completed: { background: '#f0fdf4', color: '#166534' },
};

interface Workflow {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  _count?: { tasks: number; approvals: number; reviews: number };
}

interface Project {
  id: string;
  name: string;
}

export default function WorkflowsPage() {
  const [showModal, setShowModal] = useState(false);
  const [projectFilter, setProjectFilter] = useState('');
  const [form, setForm] = useState({ projectId: '', name: '', description: '' });
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: workflows = [], isLoading } = useQuery<Workflow[]>({
    queryKey: ['workflows', projectFilter],
    queryFn: () => workflowsApi.list(projectFilter ? { projectId: projectFilter } : undefined),
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => workflowsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflows'] });
      setShowModal(false);
      setForm({ projectId: '', name: '', description: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => workflowsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workflows'] }),
  });

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Team Workflows</h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>Manage architecture reviews, approvals, and governance workflows</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select style={{ ...inputStyle, width: 200 }} value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
            <option value="">All Projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button style={btnStyle} onClick={() => setShowModal(true)}>+ New Workflow</button>
        </div>
      </div>

      {isLoading ? <div>Loading...</div> : (
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Name', 'Project', 'Status', 'Tasks', 'Approvals', 'Reviews', 'Created', 'Actions'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workflows.length === 0 ? (
              <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8' }}>No workflows yet. Create your first one.</td></tr>
            ) : workflows.map((w) => {
              const project = projects.find((p) => p.id === w.projectId);
              const statusStyle = statusColors[w.status] ?? statusColors.pending;
              return (
                <tr key={w.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/workflows/${w.id}`)}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#1e40af' }}>{w.name}</td>
                  <td style={tdStyle}>{project?.name ?? '—'}</td>
                  <td style={tdStyle}>
                    <span style={{ ...statusStyle, borderRadius: 4, padding: '2px 10px', fontSize: 12 }}>{w.status}</span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{w._count?.tasks ?? 0}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{w._count?.approvals ?? 0}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{w._count?.reviews ?? 0}</td>
                  <td style={tdStyle}>{new Date(w.createdAt).toLocaleDateString()}</td>
                  <td style={tdStyle} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => deleteMutation.mutate(w.id)}
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
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Workflow</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Project *</label>
              <select style={inputStyle} value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
                <option value="">— Select project —</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Workflow Name *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Architecture Review" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Description</label>
              <input style={inputStyle} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ ...btnStyle, background: '#64748b' }}>Cancel</button>
              <button
                onClick={() => createMutation.mutate({ projectId: form.projectId, name: form.name, description: form.description || undefined })}
                style={btnStyle}
                disabled={!form.projectId || !form.name || createMutation.isPending}
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
