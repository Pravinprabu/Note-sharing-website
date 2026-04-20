import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import './Auth.css';

const Login = () => {
  return (
    <div className="auth-page">
      <div className="auth-card glass-card text-center">
        <Link to="/" className="auth-logo">
          <BookOpen size={32} color="var(--primary)" />
        </Link>
        <h2 className="mb-2">Welcome Back</h2>
        <p className="text-secondary mb-4">Log in to access your notes and connect with peers.</p>
        
        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" className="input" placeholder="student@college.edu" required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" className="input" placeholder="••••••••" required />
          </div>
          
          <div className="auth-options">
            <label className="checkbox-label">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="forgot-link">Forgot Password?</a>
          </div>
          
          <button type="submit" className="btn btn-primary w-full btn-lg mt-4">Log In</button>
        </form>
        
        <p className="auth-footer">
          Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
