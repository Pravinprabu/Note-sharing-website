import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, User, LogOut, Upload, Menu, X } from 'lucide-react';
import { getStoredUser, clearAuthSession } from '../utils/api';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getStoredUser());
    };
    window.addEventListener('authChange', handleAuthChange);
    setCurrentUser(getStoredUser());
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearAuthSession();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  if (isAuthPage) return null;

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <BookOpen className="logo-icon" size={24} />
          <span>Note Share</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="nav-links desktop-only">
          <Link to="/dashboard" className="nav-link">Explore</Link>
          <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
          <Link to="/upload" className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Upload size={16} /> Upload Notes
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="nav-actions desktop-only">
          {currentUser ? (
            <>
              <Link to="/profile" className="profile-btn" title={`Signed in as ${currentUser.name}`}>
                <User size={20} />
              </Link>
              <button 
                onClick={handleLogout} 
                className="btn btn-ghost" 
                title="Log Out"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#EF4444' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Log in</Link>
              <Link to="/signup" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="mobile-toggle">
          {currentUser && (
            <Link to="/profile" className="profile-btn" style={{ marginRight: '0.5rem', width: '2.2rem', height: '2.2rem' }} title="Profile">
              <User size={18} />
            </Link>
          )}
          <button 
            className="icon-btn mobile-menu-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{ width: '2.5rem', height: '2.5rem' }}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <div className="container mobile-menu-content">
            <Link to="/dashboard" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Explore Notes
            </Link>
            <Link to="/leaderboard" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Leaderboard
            </Link>
            <Link to="/upload" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={18} color="var(--primary)" /> Upload Notes
            </Link>

            <div className="mobile-menu-divider" />

            {currentUser ? (
              <div className="mobile-user-section">
                <Link to="/profile" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} /> My Profile ({currentUser.name})
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="btn btn-outline w-full"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#EF4444', borderColor: '#FEE2E2', marginTop: '0.75rem' }}
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            ) : (
              <div className="mobile-auth-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link to="/login" className="btn btn-outline w-full" onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
                <Link to="/signup" className="btn btn-primary w-full" onClick={() => setIsMobileMenuOpen(false)}>Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
