import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navigation.css';

interface NavigationProps {
  isAuthenticated?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ isAuthenticated = false }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  if (!isAuthenticated) {
    return (
      <nav className="navigation">
        <div className="nav-container">
          <div className="nav-brand">
            <h1>Tauri App</h1>
          </div>
          <div className="nav-links">
            <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
              Login
            </Link>
            <Link to="/register" className={`nav-link ${isActive('/register') ? 'active' : ''}`}>
              Register
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h1>Tauri App</h1>
        </div>
        <div className="nav-links">
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link to="/users" className={`nav-link ${isActive('/users') ? 'active' : ''}`}>
            Users
          </Link>
          <button onClick={handleLogout} className="nav-link nav-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
