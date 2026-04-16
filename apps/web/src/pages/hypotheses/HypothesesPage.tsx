import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hypothesesApi } from '../../api/client';
import type { Hypothesis, HypothesisStatus } from '../../types';

const STATUSES: HypothesisStatus[] = ['unvalidated', 'validated', 'invalidated'];
const statusColors: Record<HypothesisStatus, { bg: string; border: string; text: string }> = {
  unvalidated: { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
  validated: { bg: '#f0fdf4', border: '#86efac', text: '#14532d' },
  invalidated: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' },
};

const pageStyle: React.CSSProperties = { padding: 32 };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500 };
const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%' };

export default function HypothesesPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ statement: '', status: 'unvalidated' });
  const qc = useQueryClient();

  const { data: hypotheses = [], isLoading } = useQuery<Hypothesis[]>({
    queryKey: ['hypotheses'],
    queryFn: () => hypothesesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => hypothesesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hypotheses'] }); setShowModal(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      hypothesesApi.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hypotheses'] }),
  });

  const byStatus = STATUSES.reduce<Record<HypothesisStatus, Hypothesis[]>>((acc, s) => {
    acc[s] = hypotheses.filter(h => h.status === s);
    return acc;
  }, {} as any);

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Hypotheses</h1>
        <button style={btnStyle} onClick={() => setShowModal(true)}>+ New Hypothesis</button>
      </div>

      {isLoading ? <div>Loading...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {STATUSES.map(status => {
            const { bg, border, text } = statusColors[status];
            return (
              <div key={status} style={{ background: '#f8fafc', borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', textTransform: 'capitalize', marginBottom: 12 }}>
                  {status} ({byStatus[status].length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {byStatus[status].map(h => (
                    <div key={h.id} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: 14 }}>
                      <p style={{ fontSize: 13, color: text, marginBottom: 8 }}>{h.statement}</p>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>{h.evidence?.length ?? 0} evidence item(s)</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {STATUSES.filter(s => s !== status).map(s => (
                          <button
                            key={s}
                            onClick={() => updateMutation.mutate({ id: h.id, status: s })}
                            style={{ fontSize: 11, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}
                          >
                            → {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Hypothesis</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Statement</label>
              <textarea
                style={{ ...inputStyle, height: 100, resize: 'vertical' }}
                value={form.statement}
                onChange={e => setForm(f => ({ ...f, statement: e.target.value }))}
                placeholder="Enter your hypothesis..."
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Initial Status</label>
              <select style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ ...btnStyle, background: '#64748b' }}>Cancel</button>
              <button onClick={() => createMutation.mutate(form)} style={btnStyle} disabled={!form.statement}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
