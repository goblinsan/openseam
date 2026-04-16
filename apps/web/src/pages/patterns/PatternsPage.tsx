import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patternsApi } from '../../api/client';

const pageStyle: React.CSSProperties = { padding: 32 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const thStyle: React.CSSProperties = { background: '#f8fafc', padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' };
const tdStyle: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14 };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' };
const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 };

const portabilityColors: Record<string, { bg: string; text: string }> = {
  high: { bg: '#d1fae5', text: '#065f46' },
  medium: { bg: '#fef3c7', text: '#92400e' },
  low: { bg: '#fee2e2', text: '#991b1b' },
};

const categoryColors: Record<string, { bg: string; text: string }> = {
  compute: { bg: '#ede9fe', text: '#5b21b6' },
  storage: { bg: '#dbeafe', text: '#1e40af' },
  messaging: { bg: '#fce7f3', text: '#9d174d' },
  networking: { bg: '#d1fae5', text: '#065f46' },
  identity: { bg: '#fef3c7', text: '#92400e' },
};

interface Pattern {
  id: string;
  name: string;
  category: string;
  description: string;
  portability: string;
  version: string;
  tags: string[];
  createdAt: string;
}

export default function PatternsPage() {
  const [showModal, setShowModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [form, setForm] = useState({ name: '', category: 'compute', description: '', portability: 'high', version: '1.0.0' });
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: patterns = [], isLoading } = useQuery<Pattern[]>({
    queryKey: ['patterns', categoryFilter],
    queryFn: () => patternsApi.list(categoryFilter ? { category: categoryFilter } : undefined),
  });

  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ['pattern-categories'],
    queryFn: patternsApi.categories,
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => patternsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patterns'] });
      qc.invalidateQueries({ queryKey: ['pattern-categories'] });
      setShowModal(false);
      setForm({ name: '', category: 'compute', description: '', portability: 'high', version: '1.0.0' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => patternsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patterns'] }),
  });

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Pattern Catalog</h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>Reusable portable cloud architecture patterns</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select
            style={{ ...inputStyle, width: 180 }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button style={btnStyle} onClick={() => setShowModal(true)}>+ New Pattern</button>
        </div>
      </div>

      {isLoading ? <div>Loading...</div> : (
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Name', 'Category', 'Description', 'Portability', 'Version', 'Tags', 'Actions'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patterns.length === 0 ? (
              <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8' }}>No patterns yet. Create your first pattern.</td></tr>
            ) : patterns.map((p) => {
              const pc = portabilityColors[p.portability] ?? portabilityColors.medium;
              const cc = categoryColors[p.category] ?? { bg: '#f1f5f9', text: '#475569' };
              return (
                <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/patterns/${p.id}`)}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#1e40af' }}>{p.name}</td>
                  <td style={tdStyle}>
                    <span style={{ background: cc.bg, color: cc.text, borderRadius: 4, padding: '2px 10px', fontSize: 12, textTransform: 'capitalize' }}>
                      {p.category}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</td>
                  <td style={tdStyle}>
                    <span style={{ background: pc.bg, color: pc.text, borderRadius: 4, padding: '2px 10px', fontSize: 12, textTransform: 'capitalize' }}>
                      {p.portability}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: '#64748b' }}>{p.version}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(p.tags ?? []).slice(0, 3).map((t) => (
                        <span key={t} style={{ background: '#f1f5f9', color: '#475569', borderRadius: 4, padding: '1px 8px', fontSize: 11 }}>{t}</span>
                      ))}
                    </div>
                  </td>
                  <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => deleteMutation.mutate(p.id)}
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
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Pattern</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Pattern Name *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., API Service" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Category *</label>
              <select style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="compute">Compute</option>
                <option value="storage">Storage</option>
                <option value="messaging">Messaging</option>
                <option value="networking">Networking</option>
                <option value="identity">Identity</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Description *</label>
              <textarea
                style={{ ...inputStyle, height: 80, resize: 'vertical' }}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe this pattern..."
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Portability</label>
                <select style={inputStyle} value={form.portability} onChange={e => setForm(f => ({ ...f, portability: e.target.value }))}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Version</label>
                <input style={inputStyle} value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} placeholder="1.0.0" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ ...btnStyle, background: '#64748b' }}>Cancel</button>
              <button
                onClick={() => createMutation.mutate(form)}
                style={btnStyle}
                disabled={!form.name || !form.description || createMutation.isPending}
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
