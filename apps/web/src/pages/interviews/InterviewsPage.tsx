import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewsApi } from '../../api/client';
import type { Interview } from '../../types';

const pageStyle: React.CSSProperties = { padding: 32 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const thStyle: React.CSSProperties = { background: '#f8fafc', padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' };
const tdStyle: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14 };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500 };
const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none' };

const statusBadge = (status: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    scheduled: { bg: '#dbeafe', text: '#1d4ed8' },
    completed: { bg: '#d1fae5', text: '#065f46' },
    analyzed: { bg: '#ede9fe', text: '#5b21b6' },
  };
  const c = colors[status] ?? { bg: '#e2e8f0', text: '#475569' };
  return <span style={{ background: c.bg, color: c.text, borderRadius: 4, padding: '2px 8px', fontSize: 12 }}>{status}</span>;
};

export default function InterviewsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ accountId: '', interviewer: '', interviewee: '', persona: '', status: 'scheduled', scheduledAt: '', notes: '' });
  const qc = useQueryClient();

  const { data: interviews = [], isLoading } = useQuery<Interview[]>({
    queryKey: ['interviews', statusFilter],
    queryFn: () => interviewsApi.list({ status: statusFilter || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => interviewsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['interviews'] }); setShowModal(false); },
  });

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Interviews</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <select style={inputStyle} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {['scheduled', 'completed', 'analyzed'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button style={btnStyle} onClick={() => setShowModal(true)}>+ New Interview</button>
        </div>
      </div>

      {isLoading ? <div>Loading...</div> : (
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Interviewee', 'Interviewer', 'Account', 'Persona', 'Status', 'Scheduled At'].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {interviews.map(i => (
              <tr key={i.id}>
                <td style={tdStyle}>{i.interviewee}</td>
                <td style={tdStyle}>{i.interviewer}</td>
                <td style={tdStyle}>{i.account?.name || i.accountId}</td>
                <td style={tdStyle}>{i.persona}</td>
                <td style={tdStyle}>{statusBadge(i.status)}</td>
                <td style={tdStyle}>{new Date(i.scheduledAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Interview</h2>
            {[
              { field: 'accountId', label: 'Account ID' },
              { field: 'interviewer', label: 'Interviewer' },
              { field: 'interviewee', label: 'Interviewee' },
              { field: 'persona', label: 'Persona' },
              { field: 'scheduledAt', label: 'Scheduled At', type: 'datetime-local' },
              { field: 'notes', label: 'Notes' },
            ].map(({ field, label, type }) => (
              <div key={field} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>{label}</label>
                <input type={type ?? 'text'} style={{ ...inputStyle, width: '100%' }} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Status</label>
              <select style={{ ...inputStyle, width: '100%' }} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {['scheduled', 'completed', 'analyzed'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ ...btnStyle, background: '#64748b' }}>Cancel</button>
              <button onClick={() => createMutation.mutate(form)} style={btnStyle} disabled={!form.accountId || !form.interviewer}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
