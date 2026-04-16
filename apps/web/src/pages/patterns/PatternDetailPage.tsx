import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patternsApi } from '../../api/client';

const pageStyle: React.CSSProperties = { padding: 32, maxWidth: 960, margin: '0 auto' };
const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 8, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const sectionTitle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 };
const badgeStyle = (bg: string, text: string): React.CSSProperties => ({
  background: bg, color: text, borderRadius: 4, padding: '3px 12px', fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
});

const portabilityColors: Record<string, { bg: string; text: string }> = {
  high: { bg: '#d1fae5', text: '#065f46' },
  medium: { bg: '#fef3c7', text: '#92400e' },
  low: { bg: '#fee2e2', text: '#991b1b' },
};

interface ProviderConfig {
  [key: string]: string;
}

interface Pattern {
  id: string;
  name: string;
  category: string;
  description: string;
  portability: string;
  version: string;
  interfaces: string[];
  dependencies: string[];
  providers: Record<string, ProviderConfig>;
  artifacts: Record<string, string>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function PatternDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: pattern, isLoading, error } = useQuery<Pattern>({
    queryKey: ['pattern', id],
    queryFn: () => patternsApi.get(id!),
    enabled: !!id,
  });

  if (isLoading) return <div style={pageStyle}>Loading...</div>;
  if (error || !pattern) return <div style={pageStyle}>Pattern not found.</div>;

  const pc = portabilityColors[pattern.portability] ?? portabilityColors.medium;

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/patterns')}
          style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>{pattern.name}</h1>
        <span style={badgeStyle(pc.bg, pc.text)}>{pattern.portability} portability</span>
        <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>v{pattern.version}</span>
      </div>

      <div style={cardStyle}>
        <p style={sectionTitle}>Overview</p>
        <p style={{ fontSize: 15, color: '#374151', marginBottom: 16 }}>{pattern.description}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ background: '#ede9fe', color: '#5b21b6', borderRadius: 4, padding: '2px 10px', fontSize: 12, textTransform: 'capitalize' }}>{pattern.category}</span>
          {pattern.tags?.map((t) => (
            <span key={t} style={{ background: '#f1f5f9', color: '#475569', borderRadius: 4, padding: '2px 10px', fontSize: 12 }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
        {pattern.interfaces?.length > 0 && (
          <div style={{ ...cardStyle, flex: 1, marginBottom: 0 }}>
            <p style={sectionTitle}>Interfaces</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {pattern.interfaces.map((iface) => (
                <span key={iface} style={{ background: '#dbeafe', color: '#1e40af', borderRadius: 4, padding: '3px 12px', fontSize: 13, fontFamily: 'monospace' }}>{iface}</span>
              ))}
            </div>
          </div>
        )}

        {pattern.dependencies?.length > 0 && (
          <div style={{ ...cardStyle, flex: 1, marginBottom: 0 }}>
            <p style={sectionTitle}>Dependencies</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {pattern.dependencies.map((dep) => (
                <span key={dep} style={{ background: '#fce7f3', color: '#9d174d', borderRadius: 4, padding: '3px 12px', fontSize: 13, fontFamily: 'monospace' }}>{dep}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {pattern.providers && Object.keys(pattern.providers).length > 0 && (
        <div style={cardStyle}>
          <p style={sectionTitle}>Cloud Provider Mappings</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {Object.entries(pattern.providers as Record<string, ProviderConfig>).map(([provider, services]) => (
              <div key={provider} style={{ flex: 1, minWidth: 200, background: '#f8fafc', borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', marginBottom: 8 }}>{provider}</div>
                {Object.entries(services).map(([svcType, svcName]) => (
                  <div key={svcType} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{svcType}:</span>
                    <span style={{ color: '#0f172a', fontFamily: 'monospace', fontWeight: 500 }}>{svcName}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {pattern.artifacts && Object.keys(pattern.artifacts).length > 0 && (
        <div style={cardStyle}>
          <p style={sectionTitle}>Artifacts</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(pattern.artifacts as Record<string, string>).map(([type, ref]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', width: 160 }}>
                  {type.replace(/_/g, ' ')}:
                </span>
                <code style={{ fontSize: 13, background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, color: '#0f172a' }}>{ref}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
