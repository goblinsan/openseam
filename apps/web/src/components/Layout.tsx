import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  UserPlus,
  TrendingUp,
  MessageSquare,
  FileText,
  Lightbulb,
  ServerCog,
  BarChart3,
  ClipboardList,
  ClipboardCheck,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/accounts', icon: Building2, label: 'Accounts' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/leads', icon: UserPlus, label: 'Leads' },
  { to: '/opportunities', icon: TrendingUp, label: 'Opportunities' },
  { to: '/interviews', icon: MessageSquare, label: 'Interviews' },
  { to: '/interviews/templates', icon: ClipboardList, label: 'Templates' },
  { to: '/evidence', icon: FileText, label: 'Evidence' },
  { to: '/hypotheses', icon: Lightbulb, label: 'Hypotheses' },
  { to: '/intake', icon: ServerCog, label: 'Arch Intake' },
  { to: '/scoring', icon: BarChart3, label: 'Scoring' },
  { to: '/assessments', icon: ClipboardCheck, label: 'Assessments' },
];

const sidebarStyle: React.CSSProperties = {
  width: 220,
  minHeight: '100vh',
  background: '#0f172a',
  color: '#cbd5e1',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
};

const logoStyle: React.CSSProperties = {
  padding: '20px 16px 16px',
  borderBottom: '1px solid #1e293b',
};

const navStyle: React.CSSProperties = {
  padding: '12px 8px',
  flex: 1,
  overflowY: 'auto',
};

const linkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 10px',
  borderRadius: 6,
  fontSize: 14,
  color: '#94a3b8',
  marginBottom: 2,
  transition: 'background 0.15s',
};

const activeLinkStyle: React.CSSProperties = {
  ...linkStyle,
  background: '#1e3a5f',
  color: '#93c5fd',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={sidebarStyle}>
        <div style={logoStyle}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>🔍 OpenSeam</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Assessment OS</div>
        </div>
        <nav style={navStyle}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
