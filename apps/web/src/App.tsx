import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AccountsPage from './pages/accounts/AccountsPage';
import AccountDetailPage from './pages/accounts/AccountDetailPage';
import ContactsPage from './pages/contacts/ContactsPage';
import LeadsPage from './pages/leads/LeadsPage';
import OpportunitiesPage from './pages/opportunities/OpportunitiesPage';
import InterviewsPage from './pages/interviews/InterviewsPage';
import TemplatesPage from './pages/interviews/TemplatesPage';
import EvidencePage from './pages/evidence/EvidencePage';
import HypothesesPage from './pages/hypotheses/HypothesesPage';
import IntakePage from './pages/intake/IntakePage';
import NewIntakePage from './pages/intake/NewIntakePage';
import ScoringPage from './pages/scoring/ScoringPage';
import AssessmentsPage from './pages/assessments/AssessmentsPage';
import AssessmentDetailPage from './pages/assessments/AssessmentDetailPage';
import PatternsPage from './pages/patterns/PatternsPage';
import PatternDetailPage from './pages/patterns/PatternDetailPage';
import WorkspacesPage from './pages/workspaces/WorkspacesPage';
import WorkspaceDetailPage from './pages/workspaces/WorkspaceDetailPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import CICDPage from './pages/integrations/CICDPage';
import ImpactsPage from './pages/impacts/ImpactsPage';
import WorkflowsPage from './pages/workflows/WorkflowsPage';
import WorkflowDetailPage from './pages/workflows/WorkflowDetailPage';
import MigrationsPage from './pages/migrations/MigrationsPage';
import MigrationDetailPage from './pages/migrations/MigrationDetailPage';
import ExecutiveDashboardPage from './pages/executive/ExecutiveDashboardPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/accounts/:id" element={<AccountDetailPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/opportunities" element={<OpportunitiesPage />} />
        <Route path="/interviews" element={<InterviewsPage />} />
        <Route path="/interviews/templates" element={<TemplatesPage />} />
        <Route path="/evidence" element={<EvidencePage />} />
        <Route path="/hypotheses" element={<HypothesesPage />} />
        <Route path="/intake" element={<IntakePage />} />
        <Route path="/intake/new" element={<NewIntakePage />} />
        <Route path="/scoring" element={<ScoringPage />} />
        <Route path="/assessments" element={<AssessmentsPage />} />
        <Route path="/assessments/:id" element={<AssessmentDetailPage />} />
        <Route path="/patterns" element={<PatternsPage />} />
        <Route path="/patterns/:id" element={<PatternDetailPage />} />
        <Route path="/workspaces" element={<WorkspacesPage />} />
        <Route path="/workspaces/:id" element={<WorkspaceDetailPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/integrations/cicd" element={<CICDPage />} />
        <Route path="/impacts" element={<ImpactsPage />} />
        <Route path="/workflows" element={<WorkflowsPage />} />
        <Route path="/workflows/:id" element={<WorkflowDetailPage />} />
        <Route path="/migrations" element={<MigrationsPage />} />
        <Route path="/migrations/:id" element={<MigrationDetailPage />} />
        <Route path="/executive" element={<ExecutiveDashboardPage />} />
      </Routes>
    </Layout>
  );
}
