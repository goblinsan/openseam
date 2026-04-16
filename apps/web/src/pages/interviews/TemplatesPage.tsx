import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewsApi } from '../../api/client';
import type { InterviewTemplate } from '../../types';

const pageStyle: React.CSSProperties = { padding: 32 };
const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500 };
const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%' };

export default function TemplatesPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', persona: '', description: '', questions: '' });
  const qc = useQueryClient();

  const { data: templates = [], isLoading } = useQuery<InterviewTemplate[]>({
    queryKey: ['interview-templates'],
    queryFn: () => interviewsApi.listTemplates(),
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => interviewsApi.createTemplate(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['interview-templates'] }); setShowModal(false); },
  });

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Interview Templates</h1>
        <button style={btnStyle} onClick={() => setShowModal(true)}>+ New Template</button>
      </div>

      {isLoading ? <div>Loading...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {templates.map(t => (
            <div key={t.id} style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{t.name}</h3>
              <div style={{ fontSize: 12, color: '#8b5cf6', marginBottom: 8 }}>Persona: {t.persona}</div>
              {t.description && <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>{t.description}</p>}
              <div style={{ fontSize: 12, color: '#64748b' }}>{t.questions.length} question{t.questions.length !== 1 ? 's' : ''}</div>
              {t.questions.length > 0 && (
                <ul style={{ marginTop: 8, paddingLeft: 16 }}>
                  {t.questions.slice(0, 3).map((q, i) => <li key={i} style={{ fontSize: 12, color: '#475569', marginBottom: 2 }}>{q}</li>)}
                  {t.questions.length > 3 && <li style={{ fontSize: 12, color: '#94a3b8' }}>+{t.questions.length - 3} more...</li>}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Template</h2>
            {[
              { field: 'name', label: 'Name' },
              { field: 'persona', label: 'Persona' },
              { field: 'description', label: 'Description' },
            ].map(({ field, label }) => (
              <div key={field} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>{label}</label>
                <input style={inputStyle} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Questions (one per line)</label>
              <textarea
                style={{ ...inputStyle, height: 120, resize: 'vertical' }}
                value={form.questions}
                onChange={e => setForm(f => ({ ...f, questions: e.target.value }))}
                placeholder="Enter each question on a new line..."
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ ...btnStyle, background: '#64748b' }}>Cancel</button>
              <button
                onClick={() => createMutation.mutate({ ...form, questions: form.questions.split('\n').map(q => q.trim()).filter(Boolean) })}
                style={btnStyle}
                disabled={!form.name || !form.persona}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
