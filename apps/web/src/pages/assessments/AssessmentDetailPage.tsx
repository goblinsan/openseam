import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentsApi, inventoryApi, portabilityScoringApi, recommendationsApi, reportsApi } from '../../api/client';
import type { Assessment, PortabilityInventory, PortabilityScore, ScoreDimension, ProviderSummary, Recommendation, AdvisoryReport } from '../../types';

const pageStyle: React.CSSProperties = { padding: 32 };
const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 24 };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' };
const btnSmStyle: React.CSSProperties = { ...btnStyle, padding: '6px 12px', fontSize: 13 };
const sectionTitle: React.CSSProperties = { fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1e293b' };
const labelStyle: React.CSSProperties = { fontSize: 12, color: '#64748b', marginBottom: 2 };
const valueStyle: React.CSSProperties = { fontSize: 14, fontWeight: 500, color: '#1e293b' };

const statusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: '#f1f5f9', text: '#475569' },
  in_review: { bg: '#fef3c7', text: '#92400e' },
  completed: { bg: '#d1fae5', text: '#065f46' },
  delivered: { bg: '#ede9fe', text: '#5b21b6' },
};

const ratingColors: Record<string, { bg: string; text: string }> = {
  poor: { bg: '#fee2e2', text: '#991b1b' },
  fair: { bg: '#fef3c7', text: '#92400e' },
  good: { bg: '#d1fae5', text: '#065f46' },
  excellent: { bg: '#ede9fe', text: '#5b21b6' },
};

const severityColors: Record<string, { bg: string; text: string }> = {
  low: { bg: '#f0fdf4', text: '#166534' },
  medium: { bg: '#fef9c3', text: '#854d0e' },
  high: { bg: '#fef2f2', text: '#991b1b' },
  critical: { bg: '#fdf2f8', text: '#86198f' },
};

const typeColors: Record<string, { bg: string; text: string }> = {
  portable: { bg: '#d1fae5', text: '#065f46' },
  cloud_native: { bg: '#fef3c7', text: '#92400e' },
  proprietary: { bg: '#fee2e2', text: '#991b1b' },
};

export default function AssessmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: assessment, isLoading } = useQuery<Assessment & {
    inventory?: PortabilityInventory;
    portabilityScore?: PortabilityScore;
    recommendations?: Recommendation[];
    reports?: AdvisoryReport[];
  }>({
    queryKey: ['assessment', id],
    queryFn: () => assessmentsApi.get(id!),
    enabled: !!id,
  });

  const inventoryMutation = useMutation({
    mutationFn: () => inventoryApi.generate(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assessment', id] }),
  });

  const scoreMutation = useMutation({
    mutationFn: () => portabilityScoringApi.calculate(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assessment', id] }),
  });

  const recommendMutation = useMutation({
    mutationFn: () => recommendationsApi.generate(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assessment', id] }),
  });

  const reportMutation = useMutation({
    mutationFn: () => reportsApi.generate(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assessment', id] }),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => assessmentsApi.update(id!, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assessment', id] }),
  });

  if (isLoading) return <div style={pageStyle}>Loading...</div>;
  if (!assessment) return <div style={pageStyle}>Assessment not found.</div>;

  const sc = statusColors[assessment.status] ?? statusColors.draft;
  const score = assessment.portabilityScore;
  const inventory = assessment.inventory;
  const recommendations = assessment.recommendations ?? [];
  const reports = assessment.reports ?? [];

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <button onClick={() => navigate('/assessments')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 13, cursor: 'pointer', marginBottom: 8, padding: 0 }}>
            ← Back to Assessments
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{assessment.name}</h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#64748b' }}>{assessment.organizationName} · {assessment.projectName}</span>
            <span style={{ background: sc.bg, color: sc.text, borderRadius: 4, padding: '2px 10px', fontSize: 12, textTransform: 'capitalize' }}>
              {assessment.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}
            value={assessment.status}
            onChange={e => statusMutation.mutate(e.target.value)}
          >
            {['draft', 'in_review', 'completed', 'delivered'].map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Workflow */}
      <div style={{ ...cardStyle, background: '#f8fafc' }}>
        <p style={sectionTitle}>Assessment Workflow</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180, background: '#fff', borderRadius: 8, padding: 16, border: `2px solid ${inventory ? '#22c55e' : '#e2e8f0'}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>1. INVENTORY</div>
            <div style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>{inventory ? `${inventory.services?.length ?? 0} services · ${inventory.lockInRisks?.length ?? 0} risks` : 'Not generated'}</div>
            <button
              onClick={() => inventoryMutation.mutate()}
              style={{ ...btnSmStyle, background: inventory ? '#059669' : '#3b82f6' }}
              disabled={inventoryMutation.isPending}
            >
              {inventoryMutation.isPending ? 'Generating...' : inventory ? 'Regenerate' : 'Generate Inventory'}
            </button>
          </div>

          <div style={{ flex: 1, minWidth: 180, background: '#fff', borderRadius: 8, padding: 16, border: `2px solid ${score ? '#22c55e' : '#e2e8f0'}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>2. SCORE</div>
            <div style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>{score ? `${score.overallScore.toFixed(1)}/100 (${score.rating})` : 'Not calculated'}</div>
            <button
              onClick={() => scoreMutation.mutate()}
              style={{ ...btnSmStyle, background: score ? '#059669' : '#3b82f6' }}
              disabled={scoreMutation.isPending || !inventory}
            >
              {scoreMutation.isPending ? 'Calculating...' : score ? 'Recalculate' : 'Calculate Score'}
            </button>
          </div>

          <div style={{ flex: 1, minWidth: 180, background: '#fff', borderRadius: 8, padding: 16, border: `2px solid ${recommendations.length > 0 ? '#22c55e' : '#e2e8f0'}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>3. RECOMMENDATIONS</div>
            <div style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>{recommendations.length > 0 ? `${recommendations.length} recommendations` : 'Not generated'}</div>
            <button
              onClick={() => recommendMutation.mutate()}
              style={{ ...btnSmStyle, background: recommendations.length > 0 ? '#059669' : '#3b82f6' }}
              disabled={recommendMutation.isPending || !inventory}
            >
              {recommendMutation.isPending ? 'Generating...' : recommendations.length > 0 ? 'Regenerate' : 'Generate'}
            </button>
          </div>

          <div style={{ flex: 1, minWidth: 180, background: '#fff', borderRadius: 8, padding: 16, border: `2px solid ${reports.length > 0 ? '#22c55e' : '#e2e8f0'}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>4. REPORT</div>
            <div style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>{reports.length > 0 ? `${reports.length} report(s)` : 'Not generated'}</div>
            <button
              onClick={() => reportMutation.mutate()}
              style={{ ...btnSmStyle, background: reports.length > 0 ? '#059669' : '#3b82f6' }}
              disabled={reportMutation.isPending}
            >
              {reportMutation.isPending ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Score Card */}
      {score && (
        <div style={cardStyle}>
          <p style={sectionTitle}>Portability Scorecard</p>
          <div style={{ display: 'flex', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#1e40af' }}>{score.overallScore.toFixed(1)}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Overall Score / 100</div>
              {(() => {
                const rc = ratingColors[score.rating] ?? ratingColors.fair;
                return <span style={{ background: rc.bg, color: rc.text, borderRadius: 4, padding: '4px 12px', fontSize: 13, fontWeight: 600, display: 'inline-block', marginTop: 8, textTransform: 'capitalize' }}>{score.rating}</span>;
              })()}
            </div>
            <div style={{ flex: 1, minWidth: 300 }}>
              {(score.dimensions as ScoreDimension[]).map((dim) => (
                <div key={dim.name} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span>{dim.name}</span>
                    <span style={{ color: '#64748b' }}>{dim.rawScore.toFixed(0)}/100 ({(dim.weight * 100).toFixed(0)}%)</span>
                  </div>
                  <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3 }}>
                    <div style={{ width: `${dim.rawScore}%`, height: '100%', background: dim.rawScore >= 80 ? '#22c55e' : dim.rawScore >= 60 ? '#3b82f6' : dim.rawScore >= 40 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inventory */}
      {inventory && (
        <div style={cardStyle}>
          <p style={sectionTitle}>Portability Inventory</p>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ background: '#eff6ff', borderRadius: 8, padding: 16, textAlign: 'center', minWidth: 120 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1e40af' }}>{inventory.services?.length ?? 0}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Services</div>
            </div>
            <div style={{ background: '#fef2f2', borderRadius: 8, padding: 16, textAlign: 'center', minWidth: 120 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#991b1b' }}>{inventory.lockInRisks?.length ?? 0}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Lock-in Risks</div>
            </div>
            {(inventory.providerSummaries as ProviderSummary[]).map((ps) => (
              <div key={ps.provider} style={{ background: '#f8fafc', borderRadius: 8, padding: 16, minWidth: 140 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', textTransform: 'uppercase' }}>{ps.provider}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{ps.serviceCount} services · {ps.proprietaryServices} proprietary</div>
                {(() => {
                  const sc2 = severityColors[ps.portabilityRiskLevel] ?? severityColors.low;
                  return <span style={{ background: sc2.bg, color: sc2.text, borderRadius: 3, padding: '2px 8px', fontSize: 11, display: 'inline-block', marginTop: 4 }}>{ps.portabilityRiskLevel} risk</span>;
                })()}
              </div>
            ))}
          </div>

          {inventory.services?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Services</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Service', 'Provider', 'Category', 'Type', 'Equivalents'].map(h => (
                      <th key={h} style={{ background: '#f8fafc', padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inventory.services.map((svc) => {
                    const tc = typeColors[svc.type] ?? typeColors.portable;
                    return (
                      <tr key={svc.id}>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 500 }}>{svc.name}</td>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase', fontSize: 12 }}>{svc.provider}</td>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>{svc.category}</td>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
                          <span style={{ background: tc.bg, color: tc.text, borderRadius: 3, padding: '2px 8px', fontSize: 11 }}>{svc.type.replace('_', ' ')}</span>
                        </td>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 12, color: '#64748b' }}>{svc.equivalents.join(', ') || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {inventory.lockInRisks?.length > 0 && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Lock-in Risks</div>
              {inventory.lockInRisks.map((risk) => {
                const rc = severityColors[risk.severity] ?? severityColors.low;
                return (
                  <div key={risk.id} style={{ background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, marginBottom: 8, borderLeft: `4px solid ${rc.text}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{risk.service} <span style={{ color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>({risk.provider})</span></div>
                      <span style={{ background: rc.bg, color: rc.text, borderRadius: 3, padding: '2px 8px', fontSize: 11 }}>{risk.severity}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#475569', marginBottom: 4 }}>{risk.description}</div>
                    {risk.recommendation && <div style={{ fontSize: 12, color: '#0284c7' }}>💡 {risk.recommendation}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div style={cardStyle}>
          <p style={sectionTitle}>Recommendations ({recommendations.length})</p>
          {recommendations.map((rec) => {
            const pc = severityColors[rec.priority] ?? severityColors.low;
            return (
              <div key={rec.id} style={{ background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{rec.title}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ background: pc.bg, color: pc.text, borderRadius: 3, padding: '2px 8px', fontSize: 11 }}>Priority: {rec.priority}</span>
                    <span style={{ background: '#f0fdf4', color: '#166534', borderRadius: 3, padding: '2px 8px', fontSize: 11 }}>Impact: {rec.impact}</span>
                    <span style={{ background: '#f8fafc', color: '#475569', borderRadius: 3, padding: '2px 8px', fontSize: 11 }}>Effort: {rec.effort}</span>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 8 }}>{rec.description}</div>
                <details>
                  <summary style={{ cursor: 'pointer', fontSize: 12, color: '#3b82f6' }}>View implementation guidance</summary>
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>RATIONALE</div>
                    <div style={{ fontSize: 13, color: '#475569', marginBottom: 10 }}>{rec.rationale}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>IMPLEMENTATION</div>
                    <div style={{ fontSize: 13, color: '#475569' }}>{rec.implementationGuidance}</div>
                    {rec.relatedServices?.length > 0 && (
                      <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>Related: {rec.relatedServices.join(', ')}</div>
                    )}
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      )}

      {/* Reports */}
      {reports.length > 0 && (
        <div style={cardStyle}>
          <p style={sectionTitle}>Advisory Reports</p>
          {reports.map((report) => (
            <div key={report.id} style={{ background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{report.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Generated {new Date(report.generatedAt).toLocaleString()} · Version {report.version}</div>
                </div>
                <span style={{ background: '#f0fdf4', color: '#166534', borderRadius: 3, padding: '2px 8px', fontSize: 11 }}>
                  {report.format.toUpperCase()}
                </span>
              </div>
              <details>
                <summary style={{ cursor: 'pointer', fontSize: 12, color: '#3b82f6' }}>Preview report</summary>
                <div style={{ marginTop: 12, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: 16, fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', maxHeight: 400, overflowY: 'auto', color: '#334155' }}>
                  {report.content}
                </div>
              </details>
            </div>
          ))}
        </div>
      )}

      {/* Intake Info */}
      {assessment.intake && (
        <div style={cardStyle}>
          <p style={sectionTitle}>Architecture Intake</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><div style={labelStyle}>Organization</div><div style={valueStyle}>{assessment.intake.organizationName}</div></div>
            <div><div style={labelStyle}>Application</div><div style={valueStyle}>{assessment.intake.applicationName}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}
