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
      </Routes>
    </Layout>
  );
}
