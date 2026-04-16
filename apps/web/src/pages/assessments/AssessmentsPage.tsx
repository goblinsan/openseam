import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentsApi, intakeApi } from '../../api/client';
import type { Assessment, ArchitectureIntake } from '../../types';

const pageStyle: React.CSSProperties = { padding: 32 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const thStyle: React.CSSProperties = { background: '#f8fafc', padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' };
const tdStyle: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14 };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' };
const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 };

const statusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: '#f1f5f9', text: '#475569' },
  in_review: { bg: '#fef3c7', text: '#92400e' },
  completed: { bg: '#d1fae5', text: '#065f46' },
  delivered: { bg: '#ede9fe', text: '#5b21b6' },
};

const ratingColors: Record<string, { bg: string; text: string }> = {
  poor: { bg: '#fee2e2', text: '#991b1b' },
  fair: { bg: '#fef3c7', text: '#92400e' },
  good: { bg: '#d1fae5', text: '#065f46' },
  excellent: { bg: '#ede9fe', text: '#5b21b6' },
};

export default function AssessmentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', organizationName: '', projectName: '', intakeId: '' });
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: assessments = [], isLoading } = useQuery<Assessment[]>({
    queryKey: ['assessments'],
    queryFn: assessmentsApi.list,
  });

  const { data: intakes = [] } = useQuery<ArchitectureIntake[]>({
    queryKey: ['intakes'],
    queryFn: intakeApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => assessmentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assessments'] });
      setShowModal(false);
      setForm({ name: '', organizationName: '', projectName: '', intakeId: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assessmentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assessments'] }),
  });

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Assessments</h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>Architecture portability assessments</p>
        </div>
        <button style={btnStyle} onClick={() => setShowModal(true)}>+ New Assessment</button>
      </div>

      {isLoading ? <div>Loading...</div> : (
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Name', 'Organization', 'Project', 'Status', 'Score', 'Recommendations', 'Created', 'Actions'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assessments.length === 0 ? (
              <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8' }}>No assessments yet. Create your first one.</td></tr>
            ) : assessments.map((a) => {
              const sc = statusColors[a.status] ?? statusColors.draft;
              const score = a.portabilityScore;
              const rc = score ? (ratingColors[score.rating] ?? ratingColors.fair) : null;
              return (
                <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/assessments/${a.id}`)}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#1e40af' }}>{a.name}</td>
                  <td style={tdStyle}>{a.organizationName}</td>
                  <td style={tdStyle}>{a.projectName}</td>
                  <td style={tdStyle}>
                    <span style={{ background: sc.bg, color: sc.text, borderRadius: 4, padding: '2px 10px', fontSize: 12, textTransform: 'capitalize' }}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {score && rc ? (
                      <span style={{ background: rc.bg, color: rc.text, borderRadius: 4, padding: '2px 10px', fontSize: 12 }}>
                        {score.overallScore.toFixed(1)} ({score.rating})
                      </span>
                    ) : <span style={{ color: '#94a3b8', fontSize: 12 }}>Not scored</span>}
                  </td>
                  <td style={tdStyle}>{a._count?.recommendations ?? 0}</td>
                  <td style={tdStyle}>{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => deleteMutation.mutate(a.id)}
                      style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}
                    >Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Assessment</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Assessment Name *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Q1 2025 Cloud Assessment" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Organization Name *</label>
              <input style={inputStyle} value={form.organizationName} onChange={e => setForm(f => ({ ...f, organizationName: e.target.value }))} placeholder="e.g., Acme Corp" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Project Name *</label>
              <input style={inputStyle} value={form.projectName} onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))} placeholder="e.g., Cloud Migration 2025" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Architecture Intake (optional)</label>
              <select
                style={{ ...inputStyle }}
                value={form.intakeId}
                onChange={e => setForm(f => ({ ...f, intakeId: e.target.value }))}
              >
                <option value="">— Select intake —</option>
                {intakes.map((i) => (
                  <option key={i.id} value={i.id}>{i.organizationName} – {i.applicationName}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ ...btnStyle, background: '#64748b' }}>Cancel</button>
              <button
                onClick={() => createMutation.mutate({ ...form, intakeId: form.intakeId || undefined })}
                style={btnStyle}
                disabled={!form.name || !form.organizationName || !form.projectName || createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
