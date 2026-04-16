import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { intakeApi } from '../../api/client';
import type { ArchitectureIntake } from '../../types';

const pageStyle: React.CSSProperties = { padding: 32 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const thStyle: React.CSSProperties = { background: '#f8fafc', padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' };
const tdStyle: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14 };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500 };

export default function IntakePage() {
  const qc = useQueryClient();
  const { data: intakes = [], isLoading } = useQuery<ArchitectureIntake[]>({
    queryKey: ['intakes'],
    queryFn: () => intakeApi.list(),
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => intakeApi.submit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['intakes'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => intakeApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['intakes'] }),
  });

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Architecture Intakes</h1>
        <Link to="/intake/new" style={{ ...btnStyle, display: 'inline-block' }}>+ New Intake</Link>
      </div>

      {isLoading ? <div>Loading...</div> : (
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Organization', 'Application', 'Contact', 'Cloud Providers', 'Status', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {intakes.map(i => (
              <tr key={i.id}>
                <td style={{ ...tdStyle, fontWeight: 500 }}>{i.organizationName}</td>
                <td style={tdStyle}>{i.applicationName}</td>
                <td style={tdStyle}>{i.primaryContact}</td>
                <td style={tdStyle}>{i.cloudProviders.join(', ') || '—'}</td>
                <td style={tdStyle}>
                  <span style={{
                    background: i.status === 'submitted' ? '#d1fae5' : '#fef3c7',
                    color: i.status === 'submitted' ? '#065f46' : '#92400e',
                    borderRadius: 4, padding: '2px 8px', fontSize: 12
                  }}>
                    {i.status}
                  </span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {i.status === 'draft' && (
                      <button onClick={() => submitMutation.mutate(i.id)} style={{ background: 'none', border: '1px solid #10b981', color: '#10b981', borderRadius: 4, padding: '3px 10px', fontSize: 12 }}>
                        Submit
                      </button>
                    )}
                    <button onClick={() => deleteMutation.mutate(i.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 13 }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
