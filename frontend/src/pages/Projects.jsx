import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderKanban, Trash2, Edit2, Users, CheckSquare, AlertTriangle, X } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getInitials, getAvatarColor } from '../utils/helpers';
import toast from 'react-hot-toast';

const PROJECT_COLORS = ['#6366f1','#a855f7','#ec4899','#f59e0b','#10b981','#06b6d4','#ef4444','#f97316'];

function ProjectModal({ open, onClose, onSave, project, allUsers }) {
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1', members: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setForm({ name: project.name, description: project.description || '', color: project.color || '#6366f1', members: project.members?.map(m => m._id) || [] });
    } else {
      setForm({ name: '', description: '', color: '#6366f1', members: [] });
    }
  }, [project, open]);

  const toggleMember = (id) => {
    setForm(f => ({ ...f, members: f.members.includes(id) ? f.members.filter(m => m !== id) : [...f.members, id] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name is required.');
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save project.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div className="modal" onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
        <div className="modal-header">
          <span className="modal-title">{project ? 'Edit Project' : 'New Project'}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Website Redesign" required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief project description..." />
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PROJECT_COLORS.map(c => (
                <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid white' : '3px solid transparent', outline: form.color === c ? `2px solid ${c}` : 'none', transition: 'all 0.2s' }} />
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Add Members</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
              {allUsers.map(u => (
                <div key={u._id} onClick={() => toggleMember(u._id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', background: form.members.includes(u._id) ? 'var(--primary-light)' : 'var(--surface)', border: `1px solid ${form.members.includes(u._id) ? 'var(--primary)' : 'var(--border)'}`, transition: 'all 0.2s' }}>
                  <div className="avatar avatar-sm" style={{ background: getAvatarColor(u.name), color: 'white' }}>{getInitials(u.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{u.email}</div>
                  </div>
                  {form.members.includes(u._id) && <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'white', fontSize: 10 }}>✓</span></div>}
                </div>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" /> Saving...</> : project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Projects() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const fetchData = async () => {
    try {
      const [pRes, uRes] = await Promise.all([api.get('/projects'), api.get('/users')]);
      setProjects(pRes.data);
      setAllUsers(uRes.data);
    } catch { toast.error('Failed to load projects.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (form) => {
    if (editProject) {
      const res = await api.put(`/projects/${editProject._id}`, form);
      setProjects(p => p.map(x => x._id === res.data._id ? res.data : x));
      toast.success('Project updated!');
    } else {
      const res = await api.post('/projects', form);
      setProjects(p => [res.data, ...p]);
      toast.success('Project created!');
    }
    setEditProject(null);
  };

  const confirmDelete = (project) => {
    setProjectToDelete(project);
  };

  const executeDelete = async () => {
    if (!projectToDelete) return;
    try {
      await api.delete(`/projects/${projectToDelete._id}`);
      setProjects(p => p.filter(x => x._id !== projectToDelete._id));
      toast.success('Project deleted.');
      setProjectToDelete(null);
    } catch { 
      toast.error('Failed to delete project.');
      setProjectToDelete(null);
    }
  };

  const statusColors = { active: 'var(--success)', completed: 'var(--info)', archived: 'var(--text3)' };

  if (loading) return <div className="spinner-page"><div className="spinner-lg" /></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditProject(null); setModalOpen(true); }}>
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 60 }}>
          <div className="empty-state-icon"><FolderKanban size={28} /></div>
          <h3>No projects yet</h3>
          <p>{isAdmin ? 'Create your first project to get started.' : 'You haven\'t been added to any projects yet.'}</p>
          {isAdmin && <button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> Create Project</button>}
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((p, i) => (
            <motion.div key={p._id} className="project-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${p._id}`)}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: p.color, borderRadius: '16px 16px 0 0' }} />

              <div className="flex-between" style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: statusColors[p.status], textTransform: 'capitalize' }}>{p.status}</span>
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditProject(p); setModalOpen(true); }}><Edit2 size={13} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => confirmDelete(p)}><Trash2 size={13} /></button>
                  </div>
                )}
              </div>

              <div className="project-card-name">{p.name}</div>
              <div className="project-card-desc">{p.description || 'No description provided.'}</div>

              <div className="progress-bar" style={{ marginBottom: 8 }}>
                <div className="progress-fill" style={{ width: `${p.progress}%` }} />
              </div>
              <div className="flex-between">
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.progress}% complete</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text3)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><CheckSquare size={11} /> {p.completedTasks}/{p.totalTasks}</span>
                  {p.overdueTasks > 0 && <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 3 }}><AlertTriangle size={11} /> {p.overdueTasks}</span>}
                </div>
              </div>

              <div className="divider" style={{ margin: '12px 0' }} />
              <div className="flex-between">
                <div className="project-members">
                  {(p.members || []).slice(0, 4).map(m => (
                    <div key={m._id} className="avatar avatar-sm" style={{ background: getAvatarColor(m.name), color: 'white', border: '2px solid var(--bg2)' }} title={m.name}>{getInitials(m.name)}</div>
                  ))}
                  {p.members?.length > 4 && <div className="avatar avatar-sm" style={{ background: 'var(--surface2)', color: 'var(--text3)', border: '2px solid var(--bg2)' }}>+{p.members.length - 4}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text3)' }}>
                  <Users size={11} /> {p.members?.length || 0} members
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <ProjectModal open={modalOpen} onClose={() => { setModalOpen(false); setEditProject(null); }} onSave={handleSave} project={editProject} allUsers={allUsers} />
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {projectToDelete && (
          <div className="modal-overlay" onClick={() => setProjectToDelete(null)} style={{ zIndex: 1000 }}>
            <motion.div className="modal" style={{ maxWidth: 400, textAlign: 'center', padding: '32px 24px' }} onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Trash2 size={28} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>Delete Project?</h2>
              <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.6, marginBottom: 28 }}>
                Are you sure you want to delete the project <strong>"{projectToDelete.name}"</strong>? This will also permanently delete all tasks within it. This action cannot be undone.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={() => setProjectToDelete(null)}>Cancel</button>
                <button className="btn btn-danger" style={{ justifyContent: 'center' }} onClick={executeDelete}>Yes, Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
