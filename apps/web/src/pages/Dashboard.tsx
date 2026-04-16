import { useQuery } from '@tanstack/react-query';
import { accountsApi, leadsApi, opportunitiesApi, interviewsApi, evidenceApi, hypothesesApi } from '../api/client';

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 8,
  padding: '20px 24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const cards = [
  { key: 'accounts', label: 'Accounts', color: '#3b82f6', api: () => accountsApi.list() },
  { key: 'leads', label: 'Leads', color: '#f59e0b', api: () => leadsApi.list() },
  { key: 'opportunities', label: 'Opportunities', color: '#10b981', api: () => opportunitiesApi.list() },
  { key: 'interviews', label: 'Interviews', color: '#8b5cf6', api: () => interviewsApi.list() },
  { key: 'evidence', label: 'Evidence Items', color: '#ef4444', api: () => evidenceApi.list() },
  { key: 'hypotheses', label: 'Hypotheses', color: '#06b6d4', api: () => hypothesesApi.list() },
];

function StatCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>{count}</div>
      <div style={{ fontSize: 14, color: '#64748b' }}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const q0 = useQuery({ queryKey: [cards[0].key], queryFn: cards[0].api });
  const q1 = useQuery({ queryKey: [cards[1].key], queryFn: cards[1].api });
  const q2 = useQuery({ queryKey: [cards[2].key], queryFn: cards[2].api });
  const q3 = useQuery({ queryKey: [cards[3].key], queryFn: cards[3].api });
  const q4 = useQuery({ queryKey: [cards[4].key], queryFn: cards[4].api });
  const q5 = useQuery({ queryKey: [cards[5].key], queryFn: cards[5].api });
  const results = [q0, q1, q2, q3, q4, q5];

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>OpenSeam Discovery OS — Overview</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {cards.map(({ label, color }, i) => (
          <StatCard
            key={label}
            label={label}
            count={Array.isArray(results[i].data) ? (results[i].data as unknown[]).length : 0}
            color={color}
          />
        ))}
      </div>

      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Quick Navigation</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            { href: '/accounts', label: '🏢 Manage Accounts & CRM' },
            { href: '/opportunities', label: '📈 View Opportunity Pipeline' },
            { href: '/interviews', label: '🎤 Schedule Interviews' },
            { href: '/evidence', label: '📄 Evidence Repository' },
            { href: '/hypotheses', label: '💡 Track Hypotheses' },
            { href: '/intake', label: '🖥️ Architecture Intake' },
            { href: '/scoring', label: '📊 Opportunity Scoring' },
            { href: '/leads', label: '👤 Lead Management' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '14px 18px',
                fontSize: 14,
                fontWeight: 500,
                color: '#1e293b',
                display: 'block',
                transition: 'border-color 0.15s',
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
