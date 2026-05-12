import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trash2, Shield, UserCheck, Search, Crown, UserX } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getInitials, getAvatarColor, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Team() {
  const { user: currentUser } = useAuth();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    api.get('/users')
      .then(r => setUsers(r.data))
      .catch(() => toast.error('Failed to load team.'))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser._id) return toast.error("You can't change your own role.");
    try {
      const res = await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers(u => u.map(x => x._id === userId ? res.data : x));
      toast.success(`Role updated to ${newRole}.`);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to update role.'); }
  };

  const confirmDelete = (user) => {
    if (user._id === currentUser._id) return toast.error("You can't delete yourself.");
    setUserToDelete(user);
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/users/${userToDelete._id}`);
      setUsers(u => u.filter(x => x._id !== userToDelete._id));
      toast.success('User removed from workspace.');
      setUserToDelete(null);
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Failed to remove user.'); 
      setUserToDelete(null);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const admins  = filtered.filter(u => u.role === 'admin');
  const members = filtered.filter(u => u.role === 'member');

  if (loading) return <div className="spinner-page"><div className="spinner-lg" /></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">{users.length} member{users.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ background: 'var(--primary-light)', borderRadius: 10, padding: '8px 16px', display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>⚡ {admins.length} Admin{admins.length !== 1 ? 's' : ''}</span>
            <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>👤 {members.length} Member{members.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', flex: 1, maxWidth: 300 }}>
          <Search size={15} color="var(--text3)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14, width: '100%' }} />
        </div>
        {['all','admin','member'].map(r => (
          <button key={r} className={`filter-chip ${roleFilter === r ? 'active' : ''}`} onClick={() => setRoleFilter(r)}>
            {r === 'all' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1) + 's'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><UserX size={26} /></div>
          <h3>No users found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <motion.tr key={u._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="avatar avatar-md" style={{ background: getAvatarColor(u.name), color: 'white' }}>{getInitials(u.name)}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {u.name}
                            {u._id === currentUser._id && <span style={{ fontSize: 10, background: 'var(--primary-light)', color: 'var(--primary)', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>You</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text3)' }}>{u.email}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`badge badge-${u.role}`}>
                          {u.role === 'admin' ? '⚡ ' : '👤 '}{u.role}
                        </span>
                        {u._id !== currentUser._id && (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: 11, padding: '3px 10px', color: u.role === 'admin' ? 'var(--warning)' : 'var(--primary)' }}
                            onClick={() => handleRoleChange(u._id, u.role === 'admin' ? 'member' : 'admin')}
                            title={u.role === 'admin' ? 'Demote to Member' : 'Promote to Admin'}
                          >
                            {u.role === 'admin' ? <><UserCheck size={11} /> Demote</> : <><Crown size={11} /> Promote</>}
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text3)' }}>{formatDate(u.createdAt)}</td>
                    <td>
                      {u._id !== currentUser._id ? (
                        <button className="btn btn-danger btn-sm" onClick={() => confirmDelete(u)}>
                          <Trash2 size={12} /> Remove
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text3)' }}>—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Team stats footer */}
      <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Members', value: users.length, icon: <Users size={20} />, color: 'var(--primary)', bg: 'var(--primary-light)' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: <Shield size={20} />, color: 'var(--warning)', bg: 'var(--warning-light)' },
          { label: 'Regular Members', value: users.filter(u => u.role === 'member').length, icon: <UserCheck size={20} />, color: 'var(--success)', bg: 'var(--success-light)' },
        ].map((s, i) => (
          <motion.div key={i} className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </motion.div>
        ))}
      </div>
      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {userToDelete && (
          <div className="modal-overlay" onClick={() => setUserToDelete(null)}>
            <motion.div className="modal" style={{ maxWidth: 400, textAlign: 'center', padding: '32px 24px' }} onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Trash2 size={28} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>Remove Member?</h2>
              <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.6, marginBottom: 28 }}>
                Are you sure you want to remove <strong>{userToDelete.name}</strong> from the workspace? They will lose access to all projects and tasks. This action cannot be undone.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={() => setUserToDelete(null)}>Cancel</button>
                <button className="btn btn-danger" style={{ justifyContent: 'center' }} onClick={executeDelete}>Yes, Remove</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
