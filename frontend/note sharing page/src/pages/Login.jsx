import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { API_BASE, setAuthSession } from '../utils/api';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        setAuthSession(data.token, data.user);
        setMessage('Login successful!');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setMessage(data.message || 'Login failed.');
      }
    } catch (error) {
      setMessage('Error connecting to server.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card text-center">
        <Link to="/" className="auth-logo">
          <BookOpen size={32} color="var(--primary)" />
        </Link>
        <h2 className="mb-2">Welcome Back</h2>
        <p className="text-secondary mb-4">Log in to access your notes and connect with peers.</p>

        {message && <p style={{color: message.includes('success') ? 'green' : 'red', marginBottom: '10px'}}>{message}</p>}
        
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" className="input" placeholder="(eg: 241025.it@rmkec.ac.in or 24it1025@rmkec.ac.in)" required value={email} onChange={e => setEmail(e.target.value)} />
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              e.g. <strong>241025.it@rmkec.ac.in</strong> or <strong>24it1025@rmkec.ac.in</strong>
            </span>
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" className="input" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
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
