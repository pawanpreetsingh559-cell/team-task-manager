import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, User } from 'lucide-react';
import api from '../api/axios';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../utils/helpers';
import { getInitials, getAvatarColor } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function TaskModal({ open, onClose, onSave, task, projectId, projectMembers = [], allProjects = [] }) {
  const [form, setForm] = useState({
    title: '', description: '', project: projectId || '',
    assignee: '', status: 'todo', priority: 'medium', dueDate: '', tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);

  useEffect(() => {
    if (!projectMembers || projectMembers.length === 0) {
      api.get('/users').then(res => setWorkspaceMembers(res.data)).catch(() => {});
    }
  }, [projectMembers]);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        project: task.project?._id || task.project || projectId || '',
        assignee: task.assignee?._id || task.assignee || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
        tags: (task.tags || []).join(', ')
      });
    } else {
      setForm({ title: '', description: '', project: projectId || '', assignee: '', status: 'todo', priority: 'medium', dueDate: '', tags: '' });
    }
  }, [task, open, projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Task title is required.');
    if (!form.project) return toast.error('Please select a project.');
    setLoading(true);
    try {
      const payload = {
        ...form,
        assignee: form.assignee || null,
        dueDate: form.dueDate || null,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      };
      await onSave(payload, task?._id);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save task.');
    } finally {
      setLoading(false);
    }
  };

  const members = projectMembers?.length > 0 ? projectMembers : workspaceMembers;

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
        <div className="modal-header">
          <span className="modal-title">{task ? 'Edit Task' : 'Create Task'}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="What needs to be done?" required />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Add details..." style={{ minHeight: 80 }} />
          </div>

          {allProjects.length > 0 && !projectId && (
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select className="form-input" value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))} required>
                <option value="">Select project...</option>
                {allProjects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label"><User size={12} style={{ display: 'inline', marginRight: 4 }} />Assignee</label>
              <select className="form-input" value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label"><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />Due Date</label>
              <input type="date" className="form-input" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label"><Tag size={12} style={{ display: 'inline', marginRight: 4 }} />Tags (comma separated)</label>
            <input className="form-input" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="design, frontend, bug..." />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" /> Saving...</> : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
