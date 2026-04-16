import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowsApi } from '../../api/client';

const pageStyle: React.CSSProperties = { padding: 32 };
const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 24 };
const btnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' };
const inputStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 };

const statusColors: Record<string, React.CSSProperties> = {
  pending: { background: '#f1f5f9', color: '#475569' },
  in_progress: { background: '#dbeafe', color: '#1e40af' },
  approved: { background: '#d1fae5', color: '#065f46' },
  rejected: { background: '#fee2e2', color: '#991b1b' },
  completed: { background: '#f0fdf4', color: '#166534' },
  todo: { background: '#f1f5f9', color: '#475569' },
  review: { background: '#fef3c7', color: '#92400e' },
};

interface WorkflowTask {
  id: string;
  title: string;
  description?: string;
  assigneeId?: string;
  status: string;
  dueDate?: string;
}

interface WorkflowApproval {
  id: string;
  approverId: string;
  status: string;
  comments?: string;
}

interface WorkflowReview {
  id: string;
  reviewerId: string;
  comments: string;
  status: string;
}

interface WorkflowDetail {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  tasks: WorkflowTask[];
  approvals: WorkflowApproval[];
  reviews: WorkflowReview[];
}

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [taskForm, setTaskForm] = useState({ title: '', assigneeId: '' });
  const [approvalForm, setApprovalForm] = useState({ approverId: '' });

  const { data: workflow, isLoading } = useQuery<WorkflowDetail>({
    queryKey: ['workflows', id],
    queryFn: () => workflowsApi.get(id!),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => workflowsApi.updateStatus(id!, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workflows', id] }),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: unknown) => workflowsApi.createTask(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflows', id] });
      setTaskForm({ title: '', assigneeId: '' });
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      workflowsApi.updateTaskStatus(taskId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workflows', id] }),
  });

  const createApprovalMutation = useMutation({
    mutationFn: (data: unknown) => workflowsApi.createApproval(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflows', id] });
      setApprovalForm({ approverId: '' });
    },
  });

  if (isLoading) return <div style={pageStyle}>Loading...</div>;
  if (!workflow) return <div style={pageStyle}>Workflow not found</div>;

  const statusStyle = statusColors[workflow.status] ?? statusColors.pending;

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{workflow.name}</h1>
          {workflow.description && <p style={{ fontSize: 14, color: '#64748b' }}>{workflow.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ ...statusStyle, borderRadius: 6, padding: '4px 14px', fontSize: 13 }}>{workflow.status}</span>
          <select
            style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', fontSize: 13, cursor: 'pointer' }}
            value={workflow.status}
            onChange={e => updateStatusMutation.mutate(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Tasks */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Tasks ({workflow.tasks.length})</h2>
          {workflow.tasks.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No tasks yet.</p>
          ) : workflow.tasks.map((t) => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{t.title}</div>
                {t.assigneeId && <div style={{ fontSize: 12, color: '#64748b' }}>Assigned: {t.assigneeId}</div>}
              </div>
              <select
                style={{ border: '1px solid #e2e8f0', borderRadius: 4, padding: '3px 8px', fontSize: 12 }}
                value={t.status}
                onChange={e => updateTaskStatusMutation.mutate({ taskId: t.id, status: e.target.value })}
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          ))}
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              placeholder="Task title"
              value={taskForm.title}
              onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))}
            />
            <button
              style={{ ...btnStyle, fontSize: 13, padding: '8px 12px' }}
              onClick={() => createTaskMutation.mutate({ workflowId: id, title: taskForm.title, assigneeId: taskForm.assigneeId || undefined })}
              disabled={!taskForm.title || createTaskMutation.isPending}
            >Add</button>
          </div>
        </div>

        {/* Approvals */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Approvals ({workflow.approvals.length})</h2>
          {workflow.approvals.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No approvals yet.</p>
          ) : workflow.approvals.map((a) => (
            <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{a.approverId}</div>
                <span style={{ ...statusColors[a.status], borderRadius: 4, padding: '2px 8px', fontSize: 12 }}>{a.status}</span>
              </div>
              {a.comments && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{a.comments}</div>}
            </div>
          ))}
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Approver ID</label>
              <input
                style={inputStyle}
                placeholder="user@example.com"
                value={approvalForm.approverId}
                onChange={e => setApprovalForm(f => ({ ...f, approverId: e.target.value }))}
              />
            </div>
            <button
              style={{ ...btnStyle, fontSize: 13, padding: '8px 12px', alignSelf: 'flex-end' }}
              onClick={() => createApprovalMutation.mutate({ workflowId: id, approverId: approvalForm.approverId })}
              disabled={!approvalForm.approverId || createApprovalMutation.isPending}
            >Request</button>
          </div>
        </div>

        {/* Reviews */}
        <div style={{ ...cardStyle, gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Reviews ({workflow.reviews.length})</h2>
          {workflow.reviews.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No reviews yet.</p>
          ) : workflow.reviews.map((r) => (
            <div key={r.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{r.reviewerId}</div>
                <span style={{ ...statusColors[r.status], borderRadius: 4, padding: '2px 8px', fontSize: 12 }}>{r.status}</span>
              </div>
              <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>{r.comments}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
