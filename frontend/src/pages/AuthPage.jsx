import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckSquare, Users, TrendingUp, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const features = [
  { icon: <CheckSquare size={20} />, title: 'Task Tracking', desc: 'Create, assign and track tasks across projects with real-time status updates.' },
  { icon: <Users size={20} />, title: 'Team Collaboration', desc: 'Add members to projects and collaborate seamlessly with role-based access.' },
  { icon: <TrendingUp size={20} />, title: 'Progress Insights', desc: 'Visual dashboard with stats, overdue alerts, and completion metrics.' },
  { icon: <Shield size={20} />, title: 'Role-Based Access', desc: 'Admins manage teams and projects. Members focus on their tasks.' },
];

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields.');
    if (mode === 'signup' && !form.name) return toast.error('Name is required.');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back! 👋');
      } else {
        await signup({ name: form.name, email: form.email, password: form.password, role: form.role });
        toast.success('Account created successfully! 🎉');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="blob" style={{ width: 400, height: 400, background: '#6366f1', top: '10%', left: '20%' }} />
        <div className="blob" style={{ width: 300, height: 300, background: '#a855f7', bottom: '15%', right: '10%', animationDelay: '3s' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div className="auth-logo-icon" style={{ width: 48, height: 48 }}>
              <Zap size={24} color="white" fill="white" />
            </div>
            <span style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg,#6366f1,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TaskFlow</span>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 16 }}>
            Manage Teams,<br />
            <span style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ship Faster.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, marginBottom: 48, lineHeight: 1.6 }}>
            The ultimate full-stack task management platform for modern teams — with kanban boards, role-based access, and real-time progress tracking.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 + 0.3 }}
                style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 3 }}>{f.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <motion.div className="auth-form-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="auth-logo">
            <div className="auth-logo-icon"><Zap size={20} color="white" fill="white" /></div>
            <span className="auth-logo-text">TaskFlow</span>
          </div>

          <div className="auth-toggle">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
            <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Sign Up</button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <h2 className="auth-heading" style={{ marginTop: 20 }}>
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="auth-sub">{mode === 'login' ? 'Sign in to your workspace' : 'Join your team on TaskFlow'}</p>

              <form className="auth-form" onSubmit={handleSubmit}>
                {mode === 'signup' && (
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input name="name" className="form-input" placeholder="John Doe" value={form.name} onChange={handleChange} required />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input name="email" type="email" className="form-input" placeholder="john@company.com" value={form.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input name="password" type="password" className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
                </div>
                {mode === 'signup' && (
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <div className="role-toggle">
                      <div className={`role-option ${form.role === 'member' ? 'selected' : ''}`} onClick={() => setForm(f => ({ ...f, role: 'member' }))}>👤 Member</div>
                      <div className={`role-option ${form.role === 'admin' ? 'selected' : ''}`} onClick={() => setForm(f => ({ ...f, role: 'admin' }))}>⚡ Admin</div>
                    </div>
                  </div>
                )}
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 8, fontSize: 15 }} disabled={loading}>
                  {loading ? <><div className="spinner" /> Processing...</> : mode === 'login' ? 'Sign In →' : 'Create Account →'}
                </button>
              </form>

              <p className="auth-divider" style={{ marginTop: 20 }}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'signup' : 'login'); }}>
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </a>
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
