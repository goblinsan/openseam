import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from '../../api/client';
import type { Contact } from '../../types';

const pageStyle: React.CSSProperties = { padding: 32 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const thStyle: React.CSSProperties = { background: '#f8fafc', padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' };
const tdStyle: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14 };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500 };
const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%' };

export default function ContactsPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ accountId: '', firstName: '', lastName: '', email: '', role: '', phone: '' });
  const qc = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ['contacts'],
    queryFn: () => contactsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => contactsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contacts'] }); setShowModal(false); setForm({ accountId: '', firstName: '', lastName: '', email: '', role: '', phone: '' }); },
  });

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Contacts</h1>
        <button style={btnStyle} onClick={() => setShowModal(true)}>+ New Contact</button>
      </div>

      {isLoading ? <div>Loading...</div> : (
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Name', 'Email', 'Role', 'Phone'].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {contacts.map(c => (
              <tr key={c.id}>
                <td style={tdStyle}>{c.firstName} {c.lastName}</td>
                <td style={tdStyle}>{c.email}</td>
                <td style={tdStyle}>{c.role || '—'}</td>
                <td style={tdStyle}>{c.phone || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Contact</h2>
            {[
              { field: 'accountId', label: 'Account ID' },
              { field: 'firstName', label: 'First Name' },
              { field: 'lastName', label: 'Last Name' },
              { field: 'email', label: 'Email' },
              { field: 'role', label: 'Role' },
              { field: 'phone', label: 'Phone' },
            ].map(({ field, label }) => (
              <div key={field} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>{label}</label>
                <input style={inputStyle} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={() => setShowModal(false)} style={{ ...btnStyle, background: '#64748b' }}>Cancel</button>
              <button onClick={() => createMutation.mutate(form)} style={btnStyle} disabled={!form.firstName || !form.email}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
