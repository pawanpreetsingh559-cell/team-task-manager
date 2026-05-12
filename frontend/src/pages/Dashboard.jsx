import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckSquare, Clock, AlertTriangle, TrendingUp, FolderKanban, ArrowRight, Star } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { STATUS_CONFIG, PRIORITY_CONFIG, formatDate, isOverdue, getInitials, getAvatarColor } from '../utils/helpers';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, tasksRes, projectsRes] = await Promise.all([
          api.get('/tasks/stats'),
          api.get('/tasks?sortBy=createdAt&order=desc'),
          api.get('/projects'),
        ]);
        setStats(statsRes.data);
        setRecentTasks(tasksRes.data.slice(0, 6));
        setProjects(projectsRes.data.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="spinner-page"><div className="spinner-lg" /></div>;

  const statCards = [
    { label: 'Total Tasks', value: stats?.total ?? 0, icon: <CheckSquare size={22} />, bg: 'var(--primary-light)', color: 'var(--primary)' },
    { label: 'In Progress', value: stats?.inProgress ?? 0, icon: <TrendingUp size={22} />, bg: 'var(--info-light)', color: 'var(--info)' },
    { label: 'Overdue', value: stats?.overdue ?? 0, icon: <AlertTriangle size={22} />, bg: 'var(--danger-light)', color: 'var(--danger)' },
    { label: 'Completed', value: stats?.done ?? 0, icon: <Star size={22} />, bg: 'var(--success-light)', color: 'var(--success)' },
  ];

  return (
    <div className="page-content">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 className="page-title">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here's what's happening across your workspace today.</p>
      </motion.div>

      {/* Stats */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <motion.div key={i} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Tasks */}
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Recent Tasks</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><CheckSquare size={24} /></div>
              <h3>No tasks yet</h3>
              <p>Tasks will appear here once created.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentTasks.map(task => (
                <div key={task._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_CONFIG[task.status]?.dot, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{task.project?.name}</div>
                  </div>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  {isOverdue(task.dueDate, task.status) && (
                    <span style={{ color: 'var(--danger)', fontSize: 11 }}><AlertTriangle size={13} /></span>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Projects */}
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Active Projects</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><FolderKanban size={24} /></div>
              <h3>No projects yet</h3>
              <p>Projects will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {projects.map(p => (
                <div key={p._id} onClick={() => navigate(`/projects/${p._id}`)}
                  style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color }} />
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{p.completedTasks}/{p.totalTasks} tasks</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${p.progress}%` }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>{p.progress}% complete</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Overdue Summary */}
      {stats?.overdue > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ marginTop: 24, padding: '16px 20px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={18} color="var(--danger)" />
          <span style={{ fontSize: 14, color: 'var(--danger)', fontWeight: 600 }}>
            You have {stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''} that need attention.
          </span>
          <button className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate('/tasks')}>Review Now</button>
        </motion.div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
