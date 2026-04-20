import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, User, LogIn, Upload } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) return null;

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <BookOpen className="logo-icon" size={24} />
          <span>Note Share</span>
        </Link>
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link">Explore</Link>
          <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
          <Link to="/upload" className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Upload size={16} /> Upload Notes
          </Link>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn btn-ghost">Log in</Link>
          <Link to="/signup" className="btn btn-primary">Sign up</Link>
          <Link to="/profile" className="profile-btn" title="Profile">
            <User size={20} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
