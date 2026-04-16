import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { evidenceApi } from '../../api/client';
import type { Evidence, EvidenceCategory } from '../../types';

const CATEGORIES: EvidenceCategory[] = [
  'customer_interview', 'market_research', 'architecture_assessment',
  'portability_risk', 'compliance_requirement', 'product_feedback',
  'competitive_analysis', 'strategic_hypothesis',
];

const pageStyle: React.CSSProperties = { padding: 32 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const thStyle: React.CSSProperties = { background: '#f8fafc', padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' };
const tdStyle: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14 };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500 };
const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none' };

const impactColor = (level: string) => level === 'high' ? '#dc2626' : level === 'medium' ? '#d97706' : '#059669';

export default function EvidencePage() {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'customer_interview', sourceType: '', createdBy: '', confidence: 'medium', impact: 'medium', tags: '' });
  const qc = useQueryClient();

  const { data: evidence = [], isLoading } = useQuery<Evidence[]>({
    queryKey: ['evidence', categoryFilter, search],
    queryFn: () => evidenceApi.list({ category: categoryFilter || undefined, search: search || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => evidenceApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['evidence'] }); setShowModal(false); },
  });

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Evidence Repository</h1>
        <button style={btnStyle} onClick={() => setShowModal(true)}>+ Add Evidence</button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input style={inputStyle} placeholder="Search evidence..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={inputStyle} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {isLoading ? <div>Loading...</div> : (
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Title', 'Category', 'Source', 'Confidence', 'Impact', 'Created By'].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {evidence.map(e => (
              <tr key={e.id}>
                <td style={{ ...tdStyle, fontWeight: 500 }}>{e.title}</td>
                <td style={tdStyle}><span style={{ fontSize: 11, background: '#f1f5f9', borderRadius: 3, padding: '2px 6px' }}>{e.category.replace(/_/g, ' ')}</span></td>
                <td style={tdStyle}>{e.sourceType}</td>
                <td style={tdStyle}><span style={{ color: impactColor(e.confidence) }}>{e.confidence}</span></td>
                <td style={tdStyle}><span style={{ color: impactColor(e.impact) }}>{e.impact}</span></td>
                <td style={tdStyle}>{e.createdBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '85vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Add Evidence</h2>
            {[
              { field: 'title', label: 'Title' },
              { field: 'description', label: 'Description' },
              { field: 'sourceType', label: 'Source Type' },
              { field: 'createdBy', label: 'Created By' },
            ].map(({ field, label }) => (
              <div key={field} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>{label}</label>
                <input style={{ ...inputStyle, width: '100%' }} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
              </div>
            ))}
            {[
              { field: 'category', label: 'Category', options: CATEGORIES.map(c => ({ value: c, label: c.replace(/_/g, ' ') })) },
              { field: 'confidence', label: 'Confidence', options: [{ value: 'low', label: 'low' }, { value: 'medium', label: 'medium' }, { value: 'high', label: 'high' }] },
              { field: 'impact', label: 'Impact', options: [{ value: 'low', label: 'low' }, { value: 'medium', label: 'medium' }, { value: 'high', label: 'high' }] },
            ].map(({ field, label, options }) => (
              <div key={field} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>{label}</label>
                <select style={{ ...inputStyle, width: '100%' }} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}>
                  {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={() => setShowModal(false)} style={{ ...btnStyle, background: '#64748b' }}>Cancel</button>
              <button onClick={() => createMutation.mutate({ ...form, tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) })} style={btnStyle} disabled={!form.title || !form.createdBy}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
