import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Calendar, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { STATUS_CONFIG, PRIORITY_CONFIG, formatDate, isOverdue, getDaysLeft, getInitials, getAvatarColor } from '../utils/helpers';
import TaskModal from '../components/TaskModal';
import toast from 'react-hot-toast';

const STATUSES = ['all', 'todo', 'in-progress', 'in-review', 'done'];
const PRIORITIES = ['all', 'urgent', 'high', 'medium', 'low'];

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter]     = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask]   = useState(null);

  const fetchAll = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all')   params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (assigneeFilter === 'me')  params.assignee = 'me';
      const [tRes, pRes] = await Promise.all([
        api.get('/tasks', { params }),
        api.get('/projects'),
      ]);
      setTasks(tRes.data);
      setProjects(pRes.data);
    } catch { toast.error('Failed to load tasks.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [statusFilter, priorityFilter, assigneeFilter]);

  const handleSaveTask = async (form, taskId) => {
    if (taskId) {
      const res = await api.put(`/tasks/${taskId}`, form);
      setTasks(t => t.map(x => x._id === taskId ? res.data : x));
      toast.success('Task updated!');
    } else {
      const res = await api.post('/tasks', form);
      setTasks(t => [res.data, ...t]);
      toast.success('Task created!');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks(t => t.map(x => x._id === taskId ? res.data : x));
    } catch { toast.error('Failed to update status.'); }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(t => t.filter(x => x._id !== taskId));
      toast.success('Task deleted.');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to delete task.'); }
  };

  const filtered = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.project?.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const overdueTasks = filtered.filter(t => isOverdue(t.dueDate, t.status));
  const regularTasks = filtered.filter(t => !isOverdue(t.dueDate, t.status));

  if (loading) return <div className="spinner-page"><div className="spinner-lg" /></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">{filtered.length} task{filtered.length !== 1 ? 's' : ''} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTask(null); setModalOpen(true); }}>
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', flex: '1', minWidth: 200 }}>
          <Search size={15} color="var(--text3)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks or projects..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14, width: '100%' }} />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <button key={s} className={`filter-chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
              {s === 'all' ? 'All Status' : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PRIORITIES.map(p => (
            <button key={p} className={`filter-chip ${priorityFilter === p ? 'active' : ''}`} onClick={() => setPriorityFilter(p)}>
              {p === 'all' ? 'All Priority' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        <button className={`filter-chip ${assigneeFilter === 'me' ? 'active' : ''}`} onClick={() => setAssigneeFilter(f => f === 'me' ? 'all' : 'me')}>
          Assigned to me
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Filter size={24} /></div>
          <h3>No tasks found</h3>
          <p>Try adjusting your filters or create a new task.</p>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={14} /> New Task</button>
        </div>
      ) : (
        <>
          {/* Overdue section */}
          {overdueTasks.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <AlertTriangle size={15} color="var(--danger)" />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overdue ({overdueTasks.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {overdueTasks.map((task, i) => (
                  <TaskRow key={task._id} task={task} index={i} onEdit={() => { setEditTask(task); setModalOpen(true); }} onDelete={() => handleDelete(task._id)} onStatusChange={handleStatusChange} overdue />
                ))}
              </div>
            </div>
          )}

          {/* Regular tasks */}
          {regularTasks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {regularTasks.map((task, i) => (
                <TaskRow key={task._id} task={task} index={i} onEdit={() => { setEditTask(task); setModalOpen(true); }} onDelete={() => handleDelete(task._id)} onStatusChange={handleStatusChange} />
              ))}
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {modalOpen && (
          <TaskModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTask(null); }}
            onSave={handleSaveTask} task={editTask} allProjects={projects} />
        )}
      </AnimatePresence>
    </div>
  );
}

function TaskRow({ task, index, onEdit, onDelete, onStatusChange, overdue }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
      style={{ background: 'var(--bg2)', border: `1px solid ${overdue ? 'rgba(239,68,68,0.25)' : 'var(--border)'}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = overdue ? 'rgba(239,68,68,0.5)' : 'var(--border2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = overdue ? 'rgba(239,68,68,0.25)' : 'var(--border)'}>

      {/* Status dot */}
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_CONFIG[task.status]?.dot, flexShrink: 0 }} />

      {/* Title + project */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: overdue ? 'var(--danger)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
          {task.project && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: task.project.color }} />{task.project.name}</span>}
          {task.tags?.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      </div>

      {/* Priority */}
      <span className={`badge badge-${task.priority}`}>{task.priority}</span>

      {/* Status selector */}
      <select value={task.status} onChange={e => onStatusChange(task._id, e.target.value)}
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: STATUS_CONFIG[task.status]?.color, fontSize: 12, fontWeight: 600, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', outline: 'none' }}>
        {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>

      {/* Assignee */}
      {task.assignee ? (
        <div className="avatar avatar-sm" style={{ background: getAvatarColor(task.assignee.name), color: 'white' }} title={task.assignee.name}>{getInitials(task.assignee.name)}</div>
      ) : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text3)' }}>?</div>}

      {/* Due date */}
      <span style={{ fontSize: 11, color: overdue ? 'var(--danger)' : 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3, minWidth: 80, fontWeight: overdue ? 600 : 400 }}>
        {task.dueDate ? <><Calendar size={11} />{getDaysLeft(task.dueDate)}</> : '—'}
      </span>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4 }}>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onEdit}><Edit2 size={13} /></button>
        <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={onDelete}><Trash2 size={13} /></button>
      </div>
    </motion.div>
  );
}
