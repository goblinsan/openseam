import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspacesApi } from '../../api/client';

const pageStyle: React.CSSProperties = { padding: 32 };
const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer', border: '1px solid #e2e8f0', transition: 'box-shadow 0.15s' };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' };
const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 };

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  _count?: { projects: number; teams: number };
}

export default function WorkspacesPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: workspaces = [], isLoading } = useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: workspacesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => workspacesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspaces'] });
      setShowModal(false);
      setForm({ name: '', slug: '', description: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => workspacesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspaces'] }),
  });

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setForm(f => ({ ...f, name, slug }));
  };

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Workspaces</h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>Manage your organizations and teams</p>
        </div>
        <button style={btnStyle} onClick={() => setShowModal(true)}>+ New Workspace</button>
      </div>

      {isLoading ? <div>Loading...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {workspaces.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: 14 }}>No workspaces yet. Create your first one.</div>
          ) : workspaces.map((w) => (
            <div key={w.id} style={cardStyle} onClick={() => navigate(`/workspaces/${w.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{w.name}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{w.slug}</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(w.id); }}
                  style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}
                >Delete</button>
              </div>
              {w.description && (
                <p style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>{w.description}</p>
              )}
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
                <span>📁 {w._count?.projects ?? 0} projects</span>
                <span>👥 {w._count?.teams ?? 0} teams</span>
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
                Created {new Date(w.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Workspace</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Workspace Name *</label>
              <input style={inputStyle} value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g., Acme Corporation" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Slug *</label>
              <input style={inputStyle} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="e.g., acme-corporation" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Description</label>
              <input style={inputStyle} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ ...btnStyle, background: '#64748b' }}>Cancel</button>
              <button
                onClick={() => createMutation.mutate({ ...form, description: form.description || undefined })}
                style={btnStyle}
                disabled={!form.name || !form.slug || createMutation.isPending}
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
