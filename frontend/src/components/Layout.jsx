import { NavLink, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, LogOut, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAvatarColor, getInitials } from '../utils/helpers';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Layers size={20} color="white" />
          </div>
          <span className="sidebar-logo-text">Task<span>Flow</span></span>
        </div>

        <p className="sidebar-section-label">Menu</p>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FolderKanban size={18} /> Projects
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <CheckSquare size={18} /> My Tasks
          </NavLink>
          {isAdmin && (
            <NavLink to="/team" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Users size={18} /> Team
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleLogout} title="Logout">
            <div
              className="avatar avatar-md"
              style={{ background: getAvatarColor(user?.name), color: 'white' }}
            >
              {getInitials(user?.name)}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
            <LogOut size={15} color="var(--text3)" />
          </div>
        </div>
      </aside>

      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
