import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, environmentsApi } from '../../api/client';

const pageStyle: React.CSSProperties = { padding: 32, maxWidth: 960, margin: '0 auto' };
const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginBottom: 20 };
const sectionTitle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' };
const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 };

interface Environment {
  id: string;
  name: string;
  cloudProvider?: string;
  region?: string;
  createdAt: string;
}

interface Artifact {
  id: string;
  type: string;
  reference: string;
  createdAt: string;
}

interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  repositoryUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  environments: Environment[];
  artifacts: Artifact[];
}

const providerColors: Record<string, { bg: string; text: string }> = {
  aws: { bg: '#fef3c7', text: '#92400e' },
  gcp: { bg: '#dbeafe', text: '#1e40af' },
  azure: { bg: '#ede9fe', text: '#5b21b6' },
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [envForm, setEnvForm] = useState({ name: 'dev', cloudProvider: '', region: '' });

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ['project', id],
    queryFn: () => projectsApi.get(id!),
    enabled: !!id,
  });

  const createEnvMutation = useMutation({
    mutationFn: (data: unknown) => environmentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', id] });
      setShowEnvModal(false);
      setEnvForm({ name: 'dev', cloudProvider: '', region: '' });
    },
  });

  const deleteEnvMutation = useMutation({
    mutationFn: (envId: string) => environmentsApi.delete(envId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', id] }),
  });

  if (isLoading) return <div style={pageStyle}>Loading...</div>;
  if (!project) return <div style={pageStyle}>Project not found.</div>;

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/projects')}
          style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}
        >
          ← Back
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>{project.name}</h1>
          {project.description && <p style={{ fontSize: 14, color: '#64748b' }}>{project.description}</p>}
        </div>
        <span style={{
          background: project.status === 'active' ? '#d1fae5' : '#f1f5f9',
          color: project.status === 'active' ? '#065f46' : '#475569',
          borderRadius: 4, padding: '3px 12px', fontSize: 12, fontWeight: 600, marginLeft: 'auto',
        }}>{project.status}</span>
      </div>

      {project.repositoryUrl && (
        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <p style={sectionTitle}>Repository</p>
          <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: 14 }}>
            {project.repositoryUrl}
          </a>
        </div>
      )}

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{ ...sectionTitle, marginBottom: 0 }}>Environments</p>
          <button
            onClick={() => setShowEnvModal(true)}
            style={{ ...btnStyle, padding: '6px 14px', fontSize: 12 }}
          >+ Add Environment</button>
        </div>
        {project.environments?.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: 13 }}>No environments yet. Add one to get started.</div>
        ) : (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {project.environments?.map((env) => {
              const pc = providerColors[env.cloudProvider ?? ''] ?? { bg: '#f1f5f9', text: '#475569' };
              return (
                <div key={env.id} style={{ background: '#f8fafc', borderRadius: 8, padding: 16, minWidth: 180, border: '1px solid #e2e8f0', position: 'relative' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', textTransform: 'capitalize', marginBottom: 8 }}>{env.name}</div>
                  {env.cloudProvider && (
                    <span style={{ ...pc, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                      {env.cloudProvider}
                    </span>
                  )}
                  {env.region && (
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>📍 {env.region}</div>
                  )}
                  <button
                    onClick={() => deleteEnvMutation.mutate(env.id)}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 16 }}
                  >×</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {project.artifacts?.length > 0 && (
        <div style={cardStyle}>
          <p style={sectionTitle}>Artifacts</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {project.artifacts?.map((artifact) => (
              <div key={artifact.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'capitalize', width: 100 }}>{artifact.type}</span>
                <code style={{ fontSize: 13, color: '#0f172a' }}>{artifact.reference}</code>
                <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>{new Date(artifact.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showEnvModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Add Environment</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Environment Name *</label>
              <select style={inputStyle} value={envForm.name} onChange={e => setEnvForm(f => ({ ...f, name: e.target.value }))}>
                <option value="dev">Development</option>
                <option value="staging">Staging</option>
                <option value="prod">Production</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Cloud Provider</label>
              <select style={inputStyle} value={envForm.cloudProvider} onChange={e => setEnvForm(f => ({ ...f, cloudProvider: e.target.value }))}>
                <option value="">— Select provider —</option>
                <option value="aws">AWS</option>
                <option value="gcp">GCP</option>
                <option value="azure">Azure</option>
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Region</label>
              <input style={inputStyle} value={envForm.region} onChange={e => setEnvForm(f => ({ ...f, region: e.target.value }))} placeholder="e.g., us-east-1" />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowEnvModal(false)} style={{ ...btnStyle, background: '#64748b' }}>Cancel</button>
              <button
                onClick={() => createEnvMutation.mutate({
                  projectId: id,
                  name: envForm.name,
                  cloudProvider: envForm.cloudProvider || undefined,
                  region: envForm.region || undefined,
                })}
                style={btnStyle}
                disabled={createEnvMutation.isPending}
              >
                {createEnvMutation.isPending ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
