import { useQuery } from '@tanstack/react-query';
import { dashboardApi, workspacesApi } from '../../api/client';
import { useState } from 'react';

const pageStyle: React.CSSProperties = { padding: 32 };
const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };

interface RiskMetrics {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface ProviderMetrics {
  aws: number;
  gcp: number;
  azure: number;
}

interface GovernanceMetrics {
  complianceScore: number;
  violations: number;
}

interface MigrationMetrics {
  total: number;
  completed: number;
  pending: number;
  averageEstimatedCost: number;
}

interface ExecutiveDashboard {
  summary: { totalProjects: number; averagePortabilityScore: number; highRiskProjects: number };
  portability: { scoresByProject: Record<string, number> };
  risks: RiskMetrics;
  providers: ProviderMetrics;
  governance: GovernanceMetrics;
  migration: MigrationMetrics;
}

interface Workspace {
  id: string;
  name: string;
}

interface TrendPoint {
  date: string;
  portabilityScore: number;
}

function RiskBar({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
        <span style={{ color: '#475569' }}>{label}</span>
        <span style={{ fontWeight: 600, color }}>{count}</span>
      </div>
      <div style={{ background: '#f1f5f9', borderRadius: 4, height: 8 }}>
        <div style={{ background: color, borderRadius: 4, height: 8, width: `${Math.min(100, count * 10)}%`, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

function ProviderDonut({ providers }: { providers: ProviderMetrics }) {
  const total = (providers.aws ?? 0) + (providers.gcp ?? 0) + (providers.azure ?? 0) || 1;
  const items = [
    { label: 'AWS', value: providers.aws ?? 0, color: '#f97316' },
    { label: 'GCP', value: providers.gcp ?? 0, color: '#3b82f6' },
    { label: 'Azure', value: providers.azure ?? 0, color: '#8b5cf6' },
  ];
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {items.map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#475569', flex: 1 }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{Math.round((value / total) * 100)}%</span>
          </div>
        ))}
      </div>
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
          {(() => {
            let offset = 0;
            const circumference = 2 * Math.PI * 28;
            return items.map(({ label, value, color }) => {
              const pct = value / total;
              const dash = pct * circumference;
              const el = (
                <circle
                  key={label}
                  cx="40" cy="40" r="28"
                  fill="none"
                  stroke={color}
                  strokeWidth="12"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset * circumference}
                />
              );
              offset += pct;
              return el;
            });
          })()}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#1e293b' }}>
          {total}
        </div>
      </div>
    </div>
  );
}

export default function ExecutiveDashboardPage() {
  const [workspaceId, setWorkspaceId] = useState('');

  const { data: dashboardData, isLoading } = useQuery<ExecutiveDashboard>({
    queryKey: ['dashboard', workspaceId],
    queryFn: () => dashboardApi.getExecutive(workspaceId ? { workspaceId } : undefined),
  });

  const { data: workspaces = [] } = useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: workspacesApi.list,
  });

  const { data: trends = [] } = useQuery<TrendPoint[]>({
    queryKey: ['dashboard-trends'],
    queryFn: dashboardApi.getTrends,
  });

  if (isLoading) return <div style={pageStyle}>Loading dashboard...</div>;

  const d = dashboardData;
  const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', fontSize: 13 };

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Executive Dashboard</h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>Portfolio-level governance, portability, and risk insights</p>
        </div>
        <select style={inputStyle} value={workspaceId} onChange={e => setWorkspaceId(e.target.value)}>
          <option value="">All Workspaces</option>
          {workspaces.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>

      {/* KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Projects', value: d?.summary.totalProjects ?? 0, color: '#1e40af', icon: '📁' },
          { label: 'Avg Portability Score', value: `${d?.summary.averagePortabilityScore ?? 0}`, color: '#065f46', icon: '📊' },
          { label: 'High-Risk Projects', value: d?.summary.highRiskProjects ?? 0, color: '#991b1b', icon: '⚠️' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Risk Heatmap */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Risk Exposure</h2>
          {d?.risks ? (
            <>
              <RiskBar label="Critical" count={d.risks.critical} color="#dc2626" />
              <RiskBar label="High" count={d.risks.high} color="#f97316" />
              <RiskBar label="Medium" count={d.risks.medium} color="#f59e0b" />
              <RiskBar label="Low" count={d.risks.low} color="#22c55e" />
            </>
          ) : <p style={{ color: '#94a3b8' }}>No risk data available.</p>}
        </div>

        {/* Provider Distribution */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Cloud Provider Distribution</h2>
          {d?.providers ? (
            <ProviderDonut providers={d.providers} />
          ) : <p style={{ color: '#94a3b8' }}>No provider data available.</p>}
        </div>

        {/* Governance Metrics */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Governance & Compliance</h2>
          {d?.governance ? (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: '#475569' }}>Compliance Score</span>
                  <span style={{ fontWeight: 700, color: d.governance.complianceScore >= 80 ? '#065f46' : d.governance.complianceScore >= 50 ? '#92400e' : '#991b1b' }}>
                    {d.governance.complianceScore}%
                  </span>
                </div>
                <div style={{ background: '#f1f5f9', borderRadius: 8, height: 12 }}>
                  <div style={{
                    background: d.governance.complianceScore >= 80 ? '#22c55e' : d.governance.complianceScore >= 50 ? '#f59e0b' : '#dc2626',
                    borderRadius: 8, height: 12,
                    width: `${d.governance.complianceScore}%`,
                    transition: 'width 0.3s',
                  }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#475569' }}>Policy Violations</span>
                <span style={{ fontWeight: 700, color: d.governance.violations > 0 ? '#991b1b' : '#065f46' }}>{d.governance.violations}</span>
              </div>
            </div>
          ) : <p style={{ color: '#94a3b8' }}>No governance data available.</p>}
        </div>

        {/* Migration Readiness */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Migration Readiness</h2>
          {d?.migration ? (
            <div>
              {[
                { label: 'Total Scenarios', value: d.migration.total, color: '#1e40af' },
                { label: 'Completed', value: d.migration.completed, color: '#065f46' },
                { label: 'In Progress', value: d.migration.pending, color: '#92400e' },
                { label: 'Avg. Estimated Cost', value: `$${d.migration.averageEstimatedCost.toLocaleString()}`, color: '#1e293b' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
                  <span style={{ color: '#475569' }}>{label}</span>
                  <span style={{ fontWeight: 600, color }}>{value}</span>
                </div>
              ))}
            </div>
          ) : <p style={{ color: '#94a3b8' }}>No migration data available.</p>}
        </div>
      </div>

      {/* Portability Scores by Project */}
      {d?.portability && Object.keys(d.portability.scoresByProject).length > 0 && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Portability Scores by Project</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {Object.entries(d.portability.scoresByProject).map(([project, score]) => (
              <div key={project} style={{ background: '#f8fafc', borderRadius: 6, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project}</div>
                <div style={{
                  fontSize: 24, fontWeight: 700,
                  color: score >= 70 ? '#065f46' : score >= 50 ? '#92400e' : '#991b1b',
                }}>{score}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend Chart */}
      {trends.length > 0 && (
        <div style={{ ...cardStyle, marginTop: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Portability Score Trend</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
            {trends.slice(-20).map((t, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div
                  style={{
                    width: '100%',
                    background: t.portabilityScore >= 70 ? '#22c55e' : t.portabilityScore >= 50 ? '#f59e0b' : '#dc2626',
                    borderRadius: '2px 2px 0 0',
                    height: `${t.portabilityScore}%`,
                    maxHeight: 80,
                    minHeight: 4,
                  }}
                  title={`${t.date}: ${t.portabilityScore}`}
                />
                {i % 5 === 0 && <div style={{ fontSize: 9, color: '#94a3b8', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>{t.date.slice(5)}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
