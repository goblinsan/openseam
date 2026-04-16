import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunitiesApi } from '../../api/client';
import type { Opportunity, PipelineStage } from '../../types';

const STAGES: PipelineStage[] = ['prospect', 'qualified', 'design_partner', 'closed_won', 'closed_lost'];
const stageColors: Record<PipelineStage, string> = {
  prospect: '#e2e8f0',
  qualified: '#dbeafe',
  design_partner: '#ede9fe',
  closed_won: '#d1fae5',
  closed_lost: '#fee2e2',
};

const pageStyle: React.CSSProperties = { padding: 32 };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500 };
const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none' };

export default function OpportunitiesPage() {
  const [stageFilter, setStageFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ accountId: '', title: '', stage: 'prospect', value: '', isDesignPartner: false, notes: '' });
  const qc = useQueryClient();

  const { data: opps = [], isLoading } = useQuery<Opportunity[]>({
    queryKey: ['opportunities', stageFilter],
    queryFn: () => opportunitiesApi.list({ stage: stageFilter || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => opportunitiesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['opportunities'] }); setShowModal(false); },
  });

  const byStage = STAGES.reduce<Record<PipelineStage, Opportunity[]>>((acc, s) => {
    acc[s] = opps.filter(o => o.stage === s);
    return acc;
  }, {} as any);

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Opportunities</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <select style={inputStyle} value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
            <option value="">All Stages</option>
            {STAGES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <button style={btnStyle} onClick={() => setShowModal(true)}>+ New Opportunity</button>
        </div>
      </div>

      {isLoading ? <div>Loading...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {STAGES.map(stage => (
            <div key={stage} style={{ background: '#f8fafc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>
                {stage.replace('_', ' ')} ({byStage[stage].length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {byStage[stage].map(o => (
                  <div key={o.id} style={{ background: stageColors[stage], borderRadius: 6, padding: '10px 12px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{o.title}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{o.account?.name || '—'}</div>
                    {o.value && <div style={{ fontSize: 12, color: '#059669', marginTop: 2 }}>${o.value.toLocaleString()}</div>}
                    {o.isDesignPartner && <span style={{ fontSize: 11, background: '#dbeafe', color: '#1d4ed8', borderRadius: 3, padding: '1px 6px' }}>Partner</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Opportunity</h2>
            {[
              { field: 'accountId', label: 'Account ID' },
              { field: 'title', label: 'Title' },
              { field: 'value', label: 'Value ($)' },
              { field: 'notes', label: 'Notes' },
            ].map(({ field, label }) => (
              <div key={field} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>{label}</label>
                <input style={{ ...inputStyle, width: '100%' }} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
              </div>
            ))}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Stage</label>
              <select style={{ ...inputStyle, width: '100%' }} value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
                {STAGES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={form.isDesignPartner} onChange={e => setForm(f => ({ ...f, isDesignPartner: e.target.checked }))} />
                Design Partner
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ ...btnStyle, background: '#64748b' }}>Cancel</button>
              <button onClick={() => createMutation.mutate({ ...form, value: form.value ? parseFloat(form.value) : undefined })} style={btnStyle} disabled={!form.accountId || !form.title}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
