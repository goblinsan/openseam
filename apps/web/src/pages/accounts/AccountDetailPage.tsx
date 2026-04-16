import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { accountsApi } from '../../api/client';
import type { Account } from '../../types';

const sectionStyle: React.CSSProperties = { background: '#fff', borderRadius: 8, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const labelStyle: React.CSSProperties = { fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 2 };
const valueStyle: React.CSSProperties = { fontSize: 14, color: '#1e293b' };

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: account, isLoading } = useQuery<Account>({
    queryKey: ['account', id],
    queryFn: () => accountsApi.get(id!),
    enabled: !!id,
  });

  if (isLoading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (!account) return <div style={{ padding: 32 }}>Account not found</div>;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 20 }}>
        <Link to="/accounts" style={{ color: '#3b82f6', fontSize: 14 }}>← Back to Accounts</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>{account.name}</h1>
        {account.isDesignPartner && (
          <span style={{ background: '#dbeafe', color: '#1d4ed8', borderRadius: 4, padding: '2px 10px', fontSize: 13 }}>Design Partner</span>
        )}
      </div>

      <div style={sectionStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { label: 'Industry', value: account.industry },
            { label: 'Website', value: account.website },
            { label: 'Tags', value: account.tags?.join(', ') },
            { label: 'Description', value: account.description },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={labelStyle}>{label}</div>
              <div style={valueStyle}>{value || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Contacts ({account.contacts?.length ?? 0})</h2>
        {account.contacts?.length ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Name', 'Email', 'Role'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 0', fontSize: 12, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {account.contacts.map(c => (
                <tr key={c.id}>
                  <td style={{ padding: '10px 0', fontSize: 14 }}>{c.firstName} {c.lastName}</td>
                  <td style={{ padding: '10px 0', fontSize: 14 }}>{c.email}</td>
                  <td style={{ padding: '10px 0', fontSize: 14 }}>{c.role || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div style={{ color: '#94a3b8', fontSize: 14 }}>No contacts yet</div>}
      </div>

      <div style={sectionStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Opportunities ({account.opportunities?.length ?? 0})</h2>
        {account.opportunities?.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {account.opportunities.map(o => (
              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{o.title}</span>
                <span style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>{o.stage.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        ) : <div style={{ color: '#94a3b8', fontSize: 14 }}>No opportunities yet</div>}
      </div>
    </div>
  );
}
