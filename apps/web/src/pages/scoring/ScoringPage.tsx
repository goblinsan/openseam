import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scoringApi } from '../../api/client';
import type { OpportunityScore } from '../../types';

const pageStyle: React.CSSProperties = { padding: 32 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const thStyle: React.CSSProperties = { background: '#f8fafc', padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' };
const tdStyle: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14 };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500 };
const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%' };

const ratingColors: Record<string, { bg: string; text: string }> = {
  low: { bg: '#fee2e2', text: '#991b1b' },
  medium: { bg: '#fef3c7', text: '#92400e' },
  high: { bg: '#d1fae5', text: '#065f46' },
  strategic: { bg: '#ede9fe', text: '#5b21b6' },
};

const DIMENSIONS = [
  'strategicFit', 'cloudComplexity', 'vendorLockInRisk', 'technicalMaturity',
  'revenuePotential', 'urgency', 'regulatoryPressure', 'innovationReadiness',
  'designPartnerPotential', 'referenceValue',
];

export default function ScoringPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Record<string, string | number>>({ accountId: '' });
  const qc = useQueryClient();

  const { data: rankings = [], isLoading } = useQuery<OpportunityScore[]>({
    queryKey: ['scoring-rankings'],
    queryFn: () => scoringApi.rankings(),
  });

  const calcMutation = useMutation({
    mutationFn: (data: unknown) => scoringApi.calculate(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['scoring-rankings'] }); setShowModal(false); },
  });

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Opportunity Scoring</h1>
        <button style={btnStyle} onClick={() => setShowModal(true)}>+ Calculate Score</button>
      </div>

      <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: 16, marginBottom: 24, fontSize: 13, color: '#14532d' }}>
        <strong>Scoring Model:</strong> 10 weighted dimensions. Strategic Fit (20%), Cloud Complexity (15%), Vendor Lock-in Risk (15%), Revenue Potential (15%), Technical Maturity (10%), Urgency (10%), Regulatory Pressure (5%), Innovation Readiness (5%), Design Partner Potential (3%), Reference Value (2%).
        Ratings: Low (&lt;40) | Medium (40-60) | High (60-80) | Strategic (&gt;80)
      </div>

      {isLoading ? <div>Loading...</div> : (
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Rank', 'Account', 'Total Score', 'Rating', 'Calculated At', 'Breakdown'].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rankings.map((s, idx) => {
              const rc = ratingColors[s.rating] ?? { bg: '#e2e8f0', text: '#475569' };
              return (
                <tr key={s.id}>
                  <td style={{ ...tdStyle, fontWeight: 700, color: '#64748b' }}>#{idx + 1}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{s.account?.name || s.accountId}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 120, height: 8, background: '#e2e8f0', borderRadius: 4 }}>
                        <div style={{ width: `${s.totalScore}%`, height: '100%', background: '#3b82f6', borderRadius: 4 }} />
                      </div>
                      <span>{s.totalScore.toFixed(1)}</span>
                    </div>
                  </td>
                  <td style={tdStyle}><span style={{ background: rc.bg, color: rc.text, borderRadius: 4, padding: '2px 10px', fontSize: 12, textTransform: 'capitalize' }}>{s.rating}</span></td>
                  <td style={tdStyle}>{new Date(s.calculatedAt).toLocaleDateString()}</td>
                  <td style={tdStyle}>
                    <details>
                      <summary style={{ cursor: 'pointer', fontSize: 12, color: '#3b82f6' }}>View breakdown</summary>
                      <div style={{ marginTop: 8 }}>
                        {(s.breakdown as any[]).map(b => (
                          <div key={b.dimension} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '2px 0', color: '#64748b' }}>
                            <span>{b.dimension}</span>
                            <span>{b.score} × {(b.weight * 100).toFixed(0)}% = {b.weightedScore.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 540, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '85vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Calculate Opportunity Score</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Account ID *</label>
              <input style={inputStyle} value={String(form.accountId || '')} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))} />
            </div>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>Score each dimension 0–100 (default 50 if left blank):</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {DIMENSIONS.map(d => (
                <div key={d}>
                  <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 3, textTransform: 'capitalize' }}>
                    {d.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="0–100"
                    style={{ ...inputStyle, fontSize: 13 }}
                    value={form[d] !== undefined ? String(form[d]) : ''}
                    onChange={e => setForm(f => ({ ...f, [d]: e.target.value ? Number(e.target.value) : undefined as any }))}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} style={{ ...btnStyle, background: '#64748b' }}>Cancel</button>
              <button onClick={() => calcMutation.mutate(form)} style={btnStyle} disabled={!form.accountId || calcMutation.isPending}>
                {calcMutation.isPending ? 'Calculating...' : 'Calculate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
