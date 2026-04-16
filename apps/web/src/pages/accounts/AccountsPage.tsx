import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { accountsApi } from '../../api/client';
import type { Account } from '../../types';

const pageStyle: React.CSSProperties = { padding: 32 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const thStyle: React.CSSProperties = { background: '#f8fafc', padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' };
const tdStyle: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14 };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500 };
const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none' };

export default function AccountsPage() {
  const [search, setSearch] = useState('');
  const [filterDP, setFilterDP] = useState<boolean | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', industry: '', website: '', isDesignPartner: false, tags: '' });
  const qc = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ['accounts', search, filterDP],
    queryFn: () => accountsApi.list({ search: search || undefined, isDesignPartner: filterDP }),
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => accountsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts'] }); setShowModal(false); setForm({ name: '', industry: '', website: '', isDesignPartner: false, tags: '' }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => accountsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Accounts</h1>
        <button style={btnStyle} onClick={() => setShowModal(true)}>+ New Account</button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input style={inputStyle} placeholder="Search accounts..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={inputStyle} value={filterDP === undefined ? '' : String(filterDP)} onChange={e => setFilterDP(e.target.value === '' ? undefined : e.target.value === 'true')}>
          <option value="">All Accounts</option>
          <option value="true">Design Partners</option>
          <option value="false">Non Design Partners</option>
        </select>
      </div>

      {isLoading ? <div>Loading...</div> : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Industry</th>
              <th style={thStyle}>Design Partner</th>
              <th style={thStyle}>Tags</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(acc => (
              <tr key={acc.id}>
                <td style={tdStyle}><Link to={`/accounts/${acc.id}`} style={{ color: '#3b82f6', fontWeight: 500 }}>{acc.name}</Link></td>
                <td style={tdStyle}>{acc.industry || '—'}</td>
                <td style={tdStyle}>{acc.isDesignPartner ? <span style={{ background: '#dbeafe', color: '#1d4ed8', borderRadius: 4, padding: '2px 8px', fontSize: 12 }}>Partner</span> : '—'}</td>
                <td style={tdStyle}>{acc.tags.join(', ') || '—'}</td>
                <td style={tdStyle}><button onClick={() => deleteMutation.mutate(acc.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 13 }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Account</h2>
            {['name', 'industry', 'website'].map(field => (
              <div key={field} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4, textTransform: 'capitalize' }}>{field}</label>
                <input style={{ ...inputStyle, width: '100%' }} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
              </div>
            ))}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={form.isDesignPartner} onChange={e => setForm(f => ({ ...f, isDesignPartner: e.target.checked }))} />
                Design Partner
              </label>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Tags (comma-separated)</label>
              <input style={{ ...inputStyle, width: '100%' }} value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ ...btnStyle, background: '#64748b' }}>Cancel</button>
              <button onClick={() => createMutation.mutate({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) })} style={btnStyle} disabled={!form.name}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
