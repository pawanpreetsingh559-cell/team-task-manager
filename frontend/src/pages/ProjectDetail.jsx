import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Edit2, Calendar, AlertTriangle, LayoutGrid, List } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { STATUS_CONFIG, PRIORITY_CONFIG, formatDate, isOverdue, getDaysLeft, getInitials, getAvatarColor } from '../utils/helpers';
import TaskModal from '../components/TaskModal';
import toast from 'react-hot-toast';

const COLUMNS = [
  { key: 'todo',        label: 'To Do',       dot: '#6b6b85' },
  { key: 'in-progress', label: 'In Progress',  dot: '#06b6d4' },
  { key: 'in-review',   label: 'In Review',    dot: '#f59e0b' },
  { key: 'done',        label: 'Done',         dot: '#22c55e' },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView]       = useState('kanban'); // 'kanban' | 'list'
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTask, setEditTask]     = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const fetchAll = async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
      ]);
      setProject(pRes.data);
      setTasks(tRes.data);
    } catch { toast.error('Failed to load project.'); navigate('/projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleSaveTask = async (form, taskId) => {
    if (taskId) {
      const res = await api.put(`/tasks/${taskId}`, form);
      setTasks(t => t.map(x => x._id === taskId ? res.data : x));
      toast.success('Task updated!');
    } else {
      const res = await api.post('/tasks', { ...form, project: id });
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

  const confirmDelete = (task) => {
    setTaskToDelete(task);
  };

  const executeDelete = async () => {
    if (!taskToDelete) return;
    try {
      await api.delete(`/tasks/${taskToDelete._id}`);
      setTasks(t => t.filter(x => x._id !== taskToDelete._id));
      if (detailTask?._id === taskToDelete._id) setDetailTask(null);
      toast.success('Task deleted.');
      setTaskToDelete(null);
    } catch { 
      toast.error('Failed to delete task.'); 
      setTaskToDelete(null);
    }
  };

  if (loading) return <div className="spinner-page"><div className="spinner-lg" /></div>;
  if (!project) return null;

  const members = project.members || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Topbar */}
      <div className="topbar">
        <button className="btn btn-ghost btn-icon" onClick={() => navigate('/projects')}><ArrowLeft size={18} /></button>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: project.color }} />
        <div>
          <div className="topbar-title">{project.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>{project.description}</div>
        </div>
        <div className="topbar-spacer" />
        {/* Stats pills */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text3)', background: 'var(--surface)', padding: '4px 12px', borderRadius: 20 }}>
            {project.completedTasks}/{project.totalTasks} done
          </span>
          {project.overdueTasks > 0 && (
            <span style={{ fontSize: 12, color: 'var(--danger)', background: 'var(--danger-light)', padding: '4px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={11} /> {project.overdueTasks} overdue
            </span>
          )}
          <div style={{ height: 20, width: 1, background: 'var(--border)' }} />
          {/* View toggle */}
          <button className={`btn btn-ghost btn-icon btn-sm ${view === 'kanban' ? 'active' : ''}`}
            style={view === 'kanban' ? { background: 'var(--primary-light)', color: 'var(--primary)' } : {}}
            onClick={() => setView('kanban')}><LayoutGrid size={16} /></button>
          <button className={`btn btn-ghost btn-icon btn-sm`}
            style={view === 'list' ? { background: 'var(--primary-light)', color: 'var(--primary)' } : {}}
            onClick={() => setView('list')}><List size={16} /></button>
          <div style={{ height: 20, width: 1, background: 'var(--border)' }} />
          <button className="btn btn-primary btn-sm" onClick={() => { setEditTask(null); setModalOpen(true); }}>
            <Plus size={14} /> Add Task
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '24px 32px' }}>
        {view === 'kanban' ? (
          <KanbanView tasks={tasks} onStatusChange={handleStatusChange}
            onEdit={t => { setEditTask(t); setModalOpen(true); }}
            onDetail={t => setDetailTask(t)}
            onDelete={confirmDelete} />
        ) : (
          <ListView tasks={tasks}
            onEdit={t => { setEditTask(t); setModalOpen(true); }}
            onDelete={confirmDelete}
            onStatusChange={handleStatusChange} />
        )}
      </div>

      {/* Task Modal */}
      <AnimatePresence>
        {modalOpen && (
          <TaskModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTask(null); }}
            onSave={handleSaveTask} task={editTask} projectId={id} projectMembers={members} />
        )}
      </AnimatePresence>

      {/* Detail Panel */}
      <AnimatePresence>
        {detailTask && (
          <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ type: 'spring', damping: 25 }}
            style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 360, background: 'var(--bg2)', borderLeft: '1px solid var(--border)', zIndex: 500, padding: 28, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Task Detail</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditTask(detailTask); setDetailTask(null); setModalOpen(true); }}><Edit2 size={14} /></button>
                <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => confirmDelete(detailTask)}><Trash2 size={14} /></button>
                <button className="btn btn-ghost btn-icon" onClick={() => setDetailTask(null)}>✕</button>
              </div>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 12, lineHeight: 1.4 }}>{detailTask.title}</h2>
            {detailTask.description && <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20, lineHeight: 1.6 }}>{detailTask.description}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Row label="Status"><span className={`badge badge-${detailTask.status}`}>{STATUS_CONFIG[detailTask.status]?.label}</span></Row>
              <Row label="Priority"><span className={`badge badge-${detailTask.priority}`}>{PRIORITY_CONFIG[detailTask.priority]?.label}</span></Row>
              <Row label="Assignee">
                {detailTask.assignee ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="avatar avatar-sm" style={{ background: getAvatarColor(detailTask.assignee.name), color: 'white' }}>{getInitials(detailTask.assignee.name)}</div>
                    <span style={{ fontSize: 13, color: 'var(--text)' }}>{detailTask.assignee.name}</span>
                  </div>
                ) : <span style={{ color: 'var(--text3)', fontSize: 13 }}>Unassigned</span>}
              </Row>
              <Row label="Due Date">
                <span style={{ fontSize: 13, color: isOverdue(detailTask.dueDate, detailTask.status) ? 'var(--danger)' : 'var(--text)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {detailTask.dueDate ? <><Calendar size={12} />{formatDate(detailTask.dueDate)} ({getDaysLeft(detailTask.dueDate)})</> : '—'}
                </span>
              </Row>
              {detailTask.tags?.length > 0 && (
                <Row label="Tags"><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{detailTask.tags.map(t => <span key={t} className="tag">{t}</span>)}</div></Row>
              )}
              <Row label="Created by">
                <span style={{ fontSize: 13, color: 'var(--text)' }}>{detailTask.creator?.name || '—'}</span>
              </Row>
            </div>
            <div className="divider" />
            <p style={{ fontSize: 11, color: 'var(--text3)' }}>Change Status:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {COLUMNS.map(col => (
                <button key={col.key} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', gap: 8, background: detailTask.status === col.key ? 'var(--primary-light)' : '', borderColor: detailTask.status === col.key ? 'var(--primary)' : '' }}
                  onClick={() => { handleStatusChange(detailTask._id, col.key); setDetailTask(t => ({ ...t, status: col.key })); }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot }} />{col.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {taskToDelete && (
          <div className="modal-overlay" onClick={() => setTaskToDelete(null)} style={{ zIndex: 1000 }}>
            <motion.div className="modal" style={{ maxWidth: 400, textAlign: 'center', padding: '32px 24px' }} onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Trash2 size={28} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>Delete Task?</h2>
              <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.6, marginBottom: 28 }}>
                Are you sure you want to delete the task <strong>"{taskToDelete.title}"</strong>? This action cannot be undone.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={() => setTaskToDelete(null)}>Cancel</button>
                <button className="btn btn-danger" style={{ justifyContent: 'center' }} onClick={executeDelete}>Yes, Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, minWidth: 80 }}>{label}</span>
      {children}
    </div>
  );
}

function KanbanView({ tasks, onStatusChange, onEdit, onDetail, onDelete }) {
  return (
    <div className="kanban-board" style={{ height: '100%' }}>
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.key);
        return (
          <div key={col.key} className="kanban-col">
            <div className="kanban-col-header">
              <div className="kanban-col-dot" style={{ background: col.dot }} />
              <span className="kanban-col-title">{col.label}</span>
              <span className="kanban-col-count">{colTasks.length}</span>
            </div>
            <div className="kanban-col-body">
              <AnimatePresence>
                {colTasks.map(task => (
                  <motion.div key={task._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="kanban-card" onClick={() => onDetail(task)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                      <span className="kanban-card-title">{task.title}</span>
                      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <button className="btn btn-ghost btn-icon" style={{ padding: 3 }} onClick={() => onEdit(task)}><Edit2 size={11} /></button>
                        <button className="btn btn-ghost btn-icon" style={{ padding: 3, color: 'var(--danger)' }} onClick={() => onDelete(task)}><Trash2 size={11} /></button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0' }}>
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      {task.tags?.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
                    </div>
                    <div className="kanban-card-meta">
                      {task.assignee ? (
                        <div className="avatar avatar-sm" style={{ background: getAvatarColor(task.assignee.name), color: 'white' }} title={task.assignee.name}>{getInitials(task.assignee.name)}</div>
                      ) : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</div>}
                      {task.dueDate && (
                        <span className={`kanban-card-due ${isOverdue(task.dueDate, task.status) ? 'overdue' : ''}`}>
                          <Calendar size={10} />{getDaysLeft(task.dueDate)}
                        </span>
                      )}
                      <div style={{ marginLeft: 'auto' }}>
                        <select value={task.status} onChange={e => onStatusChange(task._id, e.target.value)} onClick={e => e.stopPropagation()}
                          style={{ background: 'var(--surface2)', border: 'none', color: 'var(--text3)', fontSize: 10, borderRadius: 6, padding: '2px 4px', cursor: 'pointer' }}>
                          {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {colTasks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 12px', color: 'var(--text3)', fontSize: 12, border: '2px dashed var(--border)', borderRadius: 10 }}>
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({ tasks, onEdit, onDelete, onStatusChange }) {
  if (tasks.length === 0) return (
    <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No tasks yet</h3><p>Add your first task to get started.</p></div>
  );
  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Title</th><th>Status</th><th>Priority</th><th>Assignee</th><th>Due Date</th><th>Tags</th><th></th></tr></thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task._id} className={isOverdue(task.dueDate, task.status) ? 'overdue-row' : ''}>
                <td style={{ maxWidth: 260 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                  {task.description && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.description}</div>}
                </td>
                <td>
                  <select value={task.status} onChange={e => onStatusChange(task._id, e.target.value)}
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: STATUS_CONFIG[task.status]?.color, fontSize: 12, fontWeight: 600, borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}>
                    {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </td>
                <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                <td>
                  {task.assignee ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className="avatar avatar-sm" style={{ background: getAvatarColor(task.assignee.name), color: 'white' }}>{getInitials(task.assignee.name)}</div>
                      <span style={{ fontSize: 12 }}>{task.assignee.name}</span>
                    </div>
                  ) : <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>}
                </td>
                <td>
                  <span style={{ fontSize: 12, color: isOverdue(task.dueDate, task.status) ? 'var(--danger)' : 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    {task.dueDate ? <><Calendar size={11} />{formatDate(task.dueDate)}</> : '—'}
                  </span>
                </td>
                <td><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{task.tags?.map(t => <span key={t} className="tag">{t}</span>)}</div></td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEdit(task)}><Edit2 size={13} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => onDelete(task)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
