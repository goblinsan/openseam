import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { workspacesApi } from '../../api/client';

const pageStyle: React.CSSProperties = { padding: 32, maxWidth: 960, margin: '0 auto' };
const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' };
const sectionTitle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 };

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  _count?: { environments: number; artifacts: number };
}

interface Team {
  id: string;
  name: string;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  projects: Project[];
  teams: Team[];
}

export default function WorkspaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: workspace, isLoading } = useQuery<Workspace>({
    queryKey: ['workspace', id],
    queryFn: () => workspacesApi.get(id!),
    enabled: !!id,
  });

  if (isLoading) return <div style={pageStyle}>Loading...</div>;
  if (!workspace) return <div style={pageStyle}>Workspace not found.</div>;

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/workspaces')}
          style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}
        >
          ← Back
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>{workspace.name}</h1>
          <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{workspace.slug}</div>
        </div>
      </div>

      {workspace.description && (
        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <p style={{ color: '#475569', fontSize: 14 }}>{workspace.description}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 2 }}>
          <div style={{ ...cardStyle, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={sectionTitle}>Projects</p>
              <button
                onClick={() => navigate('/projects')}
                style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
              >
                View All Projects
              </button>
            </div>
            {workspace.projects?.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 13 }}>No projects yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {workspace.projects?.map((proj) => (
                  <div
                    key={proj.id}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: 6, cursor: 'pointer' }}
                    onClick={() => navigate(`/projects/${proj.id}`)}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#1e40af' }}>{proj.name}</div>
                      {proj.description && <div style={{ fontSize: 12, color: '#64748b' }}>{proj.description}</div>}
                    </div>
                    <span style={{
                      background: proj.status === 'active' ? '#d1fae5' : '#f1f5f9',
                      color: proj.status === 'active' ? '#065f46' : '#475569',
                      borderRadius: 4, padding: '2px 8px', fontSize: 11,
                    }}>{proj.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={cardStyle}>
            <p style={sectionTitle}>Teams</p>
            {workspace.teams?.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 13 }}>No teams yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {workspace.teams?.map((team) => (
                  <div key={team.id} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 6, fontSize: 14, color: '#374151' }}>
                    👥 {team.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
