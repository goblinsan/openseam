import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../../api/client';
import type { Lead } from '../../types';

const pageStyle: React.CSSProperties = { padding: 32 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const thStyle: React.CSSProperties = { background: '#f8fafc', padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' };
const tdStyle: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14 };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500 };
const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none' };

const statusColors: Record<string, string> = {
  new: '#dbeafe',
  contacted: '#fef3c7',
  qualified: '#d1fae5',
  converted: '#dcfce7',
  lost: '#fee2e2',
};
const statusTextColors: Record<string, string> = {
  new: '#1d4ed8',
  contacted: '#92400e',
  qualified: '#065f46',
  converted: '#14532d',
  lost: '#991b1b',
};

export default function LeadsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', company: '', source: '', status: 'new', notes: '' });
  const qc = useQueryClient();

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ['leads', statusFilter, search],
    queryFn: () => leadsApi.list({ status: statusFilter || undefined, search: search || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => leadsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); setShowModal(false); },
  });

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Leads</h1>
        <button style={btnStyle} onClick={() => setShowModal(true)}>+ New Lead</button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input style={inputStyle} placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={inputStyle} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['new', 'contacted', 'qualified', 'converted', 'lost'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? <div>Loading...</div> : (
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Name', 'Email', 'Company', 'Source', 'Status'].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {leads.map(l => (
              <tr key={l.id}>
                <td style={tdStyle}>{l.name}</td>
                <td style={tdStyle}>{l.email}</td>
                <td style={tdStyle}>{l.company || '—'}</td>
                <td style={tdStyle}>{l.source || '—'}</td>
                <td style={tdStyle}>
                  <span style={{ background: statusColors[l.status], color: statusTextColors[l.status], borderRadius: 4, padding: '2px 8px', fontSize: 12, textTransform: 'capitalize' }}>
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Lead</h2>
            {[
              { field: 'name', label: 'Name' },
              { field: 'email', label: 'Email' },
              { field: 'company', label: 'Company' },
              { field: 'source', label: 'Source' },
            ].map(({ field, label }) => (
              <div key={field} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>{label}</label>
                <input style={{ ...inputStyle, width: '100%' }} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
              </div>
            ))}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Status</label>
              <select style={{ ...inputStyle, width: '100%' }} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {['new', 'contacted', 'qualified', 'converted', 'lost'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={() => setShowModal(false)} style={{ ...btnStyle, background: '#64748b' }}>Cancel</button>
              <button onClick={() => createMutation.mutate(form)} style={btnStyle} disabled={!form.name || !form.email}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
