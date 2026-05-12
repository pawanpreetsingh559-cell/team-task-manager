import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, BarChart2, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const features = [
  { icon: <Layers size={18} />, title: 'Structured Projects', desc: 'Organize work into projects with color-coded labels and member assignments.' },
  { icon: <BarChart2 size={18} />, title: 'Real-time Progress', desc: 'Live dashboard with completion rates, overdue alerts and priority metrics.' },
  { icon: <Users size={18} />, title: 'Team Collaboration', desc: 'Invite teammates, assign tasks, and move work forward together.' },
  { icon: <ShieldCheck size={18} />, title: 'Role-Based Access', desc: 'Admins control projects; members stay focused on their assignments.' },
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
        toast.success('Account created! 🚀');
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
        <div className="blob" style={{ width: 500, height: 500, background: '#0ea5e9', top: '-10%', left: '-10%' }} />
        <div className="blob" style={{ width: 350, height: 350, background: '#f59e0b', bottom: '0%', right: '-5%', animationDelay: '4s' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 500 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 52 }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(14,165,233,0.4)' }}>
              <Layers size={26} color="white" />
            </div>
            <span style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>
              Task<span style={{ color: '#0ea5e9' }}>Flow</span>
            </span>
          </div>

          <h1 style={{ fontSize: 44, fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 18, letterSpacing: '-1.5px' }}>
            Build better.<br />
            <span style={{ background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ship together.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, marginBottom: 52, lineHeight: 1.7, maxWidth: 420 }}>
            A full-stack team task manager with kanban boards, role-based access, and real-time progress tracking — built for modern teams.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#e8edf5', fontSize: 14, marginBottom: 2 }}>{f.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.55 }}>{f.desc}</div>
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
            <div className="auth-logo-icon">
              <Layers size={20} color="white" />
            </div>
            <span className="auth-logo-text">Task<span style={{ color: 'var(--primary)' }}>Flow</span></span>
          </div>

          <div className="auth-toggle">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
            <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Sign Up</button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <h2 className="auth-heading" style={{ marginTop: 22 }}>
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="auth-sub">{mode === 'login' ? 'Sign in to your workspace' : 'Join your team on TaskFlow'}</p>

              <form className="auth-form" onSubmit={handleSubmit}>
                {mode === 'signup' && (
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input name="name" className="form-input" placeholder="Pawanpreet Singh" value={form.name} onChange={handleChange} required />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input name="email" type="email" className="form-input" placeholder="you@company.com" value={form.email} onChange={handleChange} required />
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
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 8, fontSize: 15, gap: 8 }}
                  disabled={loading}
                >
                  {loading
                    ? <><div className="spinner" /> Processing...</>
                    : <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>
                  }
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
