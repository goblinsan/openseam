import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { migrationsApi } from '../../api/client';

const pageStyle: React.CSSProperties = { padding: 32 };
const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 24 };
const btnStyle: React.CSSProperties = { background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer' };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const thStyle: React.CSSProperties = { background: '#f8fafc', padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' };
const tdStyle: React.CSSProperties = { padding: '10px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 13 };

const portabilityColors: Record<string, React.CSSProperties> = {
  portable: { background: '#d1fae5', color: '#065f46' },
  cloud_native: { background: '#dbeafe', color: '#1e40af' },
  proprietary: { background: '#fee2e2', color: '#991b1b' },
};

interface ServiceMapping {
  sourceService: string;
  sourceProvider: string;
  targetService: string;
  targetProvider: string;
  portabilityClassification: string;
}

interface MigrationRecommendation {
  title: string;
  description: string;
  priority: string;
}

interface MigrationReport {
  estimatedCost: number;
  estimatedDurationWeeks: number;
  complexity: string;
  riskLevel: string;
  portabilityScoreImpact: number;
  serviceMappings: ServiceMapping[];
  recommendations: MigrationRecommendation[];
  createdAt: string;
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

export default function MigrationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: scenario, isLoading } = useQuery<MigrationScenario>({
    queryKey: ['migrations', id],
    queryFn: () => migrationsApi.get(id!),
    enabled: !!id,
  });

  const simulateMutation = useMutation({
    mutationFn: () => migrationsApi.simulate(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['migrations', id] }),
  });

  if (isLoading) return <div style={pageStyle}>Loading...</div>;
  if (!scenario) return <div style={pageStyle}>Scenario not found</div>;

  const report = scenario.report;

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
            Migration: {scenario.sourceProvider.toUpperCase()} → {scenario.targetProvider.toUpperCase()}
          </h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>Created {new Date(scenario.createdAt).toLocaleDateString()}</p>
        </div>
        {scenario.status === 'pending' && (
          <button style={btnStyle} onClick={() => simulateMutation.mutate()} disabled={simulateMutation.isPending}>
            {simulateMutation.isPending ? '⏳ Simulating...' : '▶ Run Simulation'}
          </button>
        )}
      </div>

      {!report ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#94a3b8' }}>
          <p style={{ fontSize: 16 }}>No simulation results yet. Run the simulation to generate a migration report.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Estimated Cost', value: `$${report.estimatedCost.toLocaleString()}`, color: '#1e40af' },
              { label: 'Duration', value: `${report.estimatedDurationWeeks} weeks`, color: '#065f46' },
              { label: 'Complexity', value: report.complexity, color: report.complexity === 'high' ? '#991b1b' : '#92400e' },
              { label: 'Portability Impact', value: `${report.portabilityScoreImpact > 0 ? '+' : ''}${report.portabilityScoreImpact}`, color: report.portabilityScoreImpact >= 0 ? '#065f46' : '#991b1b' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Service Mappings */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Service Mappings ({report.serviceMappings.length})</h2>
            {report.serviceMappings.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13 }}>No service mappings available.</p>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    {['Source Service', 'Source Provider', 'Target Service', 'Target Provider', 'Portability'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.serviceMappings.map((m, i) => {
                    const portStyle = portabilityColors[m.portabilityClassification] ?? portabilityColors.cloud_native;
                    return (
                      <tr key={i}>
                        <td style={tdStyle}>{m.sourceService}</td>
                        <td style={{ ...tdStyle, textTransform: 'uppercase', fontSize: 12, fontWeight: 600, color: '#f97316' }}>{m.sourceProvider}</td>
                        <td style={tdStyle}>{m.targetService}</td>
                        <td style={{ ...tdStyle, textTransform: 'uppercase', fontSize: 12, fontWeight: 600, color: '#8b5cf6' }}>{m.targetProvider}</td>
                        <td style={tdStyle}>
                          <span style={{ ...portStyle, borderRadius: 4, padding: '2px 10px', fontSize: 12 }}>{m.portabilityClassification}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Recommendations */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Recommendations</h2>
            {report.recommendations.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13 }}>No recommendations available.</p>
            ) : report.recommendations.map((r, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{r.title}</div>
                  <span style={{
                    background: r.priority === 'high' ? '#fee2e2' : r.priority === 'medium' ? '#fef3c7' : '#f1f5f9',
                    color: r.priority === 'high' ? '#991b1b' : r.priority === 'medium' ? '#92400e' : '#475569',
                    borderRadius: 4, padding: '2px 8px', fontSize: 12,
                  }}>{r.priority}</span>
                </div>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>{r.description}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
