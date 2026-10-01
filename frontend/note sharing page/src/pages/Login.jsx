import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, KeyRound, Mail, ArrowLeft, CheckCircle2, AlertCircle, X, Lock } from 'lucide-react';
import { API_BASE, setAuthSession } from '../utils/api';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Request OTP, 2 = Reset with OTP
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState(null);

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

  // Open Forgot Password Modal
  const openForgotModal = (e) => {
    e.preventDefault();
    setForgotEmail(email || '');
    setForgotOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotStep(1);
    setForgotMessage(null);
    setShowForgotModal(true);
  };

  // Step 1: Request OTP from backend via EmailJS
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage(null);

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await response.json();

      if (response.ok) {
        setForgotStep(2);
        setForgotMessage({
          type: 'success',
          text: data.message || 'OTP sent! Please check your college inbox (and spam folder).'
        });
      } else {
        setForgotMessage({
          type: 'error',
          text: data.message || 'Failed to send reset OTP.'
        });
      }
    } catch (error) {
      setForgotMessage({
        type: 'error',
        text: 'Error connecting to server. Please try again.'
      });
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setForgotMessage({
        type: 'error',
        text: 'Passwords do not match. Please re-enter.'
      });
      return;
    }

    if (newPassword.length < 6) {
      setForgotMessage({
        type: 'error',
        text: 'Password must be at least 6 characters long.'
      });
      return;
    }

    setForgotLoading(true);
    setForgotMessage(null);

    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          otp: forgotOtp,
          new_password: newPassword
        })
      });
      const data = await response.json();

      if (response.ok) {
        setForgotMessage({
          type: 'success',
          text: 'Password reset successful! You can now log in.'
        });
        setEmail(forgotEmail);
        setPassword('');
        setTimeout(() => {
          setShowForgotModal(false);
          setMessage('Password updated! Please enter your new password to log in.');
        }, 1500);
      } else {
        setForgotMessage({
          type: 'error',
          text: data.message || 'Invalid or expired OTP.'
        });
      }
    } catch (error) {
      setForgotMessage({
        type: 'error',
        text: 'Error connecting to server. Please try again.'
      });
    } finally {
      setForgotLoading(false);
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

        {message && <p style={{color: message.includes('successful') || message.includes('updated') ? 'green' : 'red', marginBottom: '10px'}}>{message}</p>}
        
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
            <button 
              type="button" 
              onClick={openForgotModal} 
              className="forgot-link" 
              style={{ background: 'none', border: 'none', padding: 0, font: 'inherit' }}
            >
              Forgot Password?
            </button>
          </div>
          
          <button type="submit" className="btn btn-primary w-full btn-lg mt-4">Log In</button>
        </form>
        
        <p className="auth-footer">
          Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => !forgotLoading && setShowForgotModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <KeyRound size={20} color="var(--primary)" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                  {forgotStep === 1 ? 'Reset Password' : 'Enter OTP & New Password'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowForgotModal(false)}
                disabled={forgotLoading}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {forgotMessage && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                backgroundColor: forgotMessage.type === 'success' ? '#DEF7EC' : '#FDE8E8',
                color: forgotMessage.type === 'success' ? '#03543F' : '#9B1C1C',
                lineHeight: 1.4
              }}>
                {forgotMessage.type === 'success' ? <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />}
                <span>{forgotMessage.text}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              /* Step 1: Request OTP */
              <form onSubmit={handleRequestOtp}>
                <p className="text-secondary text-sm mb-4" style={{ textAlign: 'left' }}>
                  Enter your registered RMKEC email. We will send a secure 6-digit OTP code to your inbox to reset your password.
                </p>

                <div className="input-group">
                  <label htmlFor="forgot-email" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={16} /> College Email Address
                  </label>
                  <input 
                    type="email" 
                    id="forgot-email" 
                    className="input" 
                    placeholder="241025.it@rmkec.ac.in or 24it1025@rmkec.ac.in" 
                    required 
                    value={forgotEmail} 
                    onChange={e => setForgotEmail(e.target.value)} 
                    disabled={forgotLoading}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-full btn-lg mt-4" 
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Sending OTP to email...' : 'Send Reset Code'}
                </button>
              </form>
            ) : (
              /* Step 2: Verify OTP & Choose New Password */
              <form onSubmit={handleResetPassword}>
                <p className="text-secondary text-sm mb-4" style={{ textAlign: 'left' }}>
                  We sent a 6-digit verification code to <strong>{forgotEmail}</strong>. (Valid for 10 minutes).
                </p>

                <div className="input-group">
                  <label htmlFor="otp-code">6-Digit OTP Code</label>
                  <input 
                    type="text" 
                    id="otp-code" 
                    className="input" 
                    placeholder="e.g. 583921" 
                    maxLength={6} 
                    required 
                    value={forgotOtp} 
                    onChange={e => setForgotOtp(e.target.value.replace(/\D/g, ''))} 
                    disabled={forgotLoading}
                    style={{ letterSpacing: '4px', fontSize: '1.15rem', fontWeight: 600, textAlign: 'center' }}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="new-password" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Lock size={16} /> New Password
                  </label>
                  <input 
                    type="password" 
                    id="new-password" 
                    className="input" 
                    placeholder="At least 6 characters" 
                    required 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    disabled={forgotLoading}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="confirm-password" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Lock size={16} /> Confirm New Password
                  </label>
                  <input 
                    type="password" 
                    id="confirm-password" 
                    className="input" 
                    placeholder="Re-enter new password" 
                    required 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    disabled={forgotLoading}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-full btn-lg mt-4" 
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Updating Password...' : 'Reset Password'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <button 
                    type="button" 
                    onClick={() => { setForgotStep(1); setForgotMessage(null); }}
                    className="btn btn-ghost"
                    style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                    disabled={forgotLoading}
                  >
                    <ArrowLeft size={14} style={{ marginRight: '4px' }} /> Change Email
                  </button>

                  <button 
                    type="button" 
                    onClick={handleRequestOtp} 
                    className="btn btn-ghost"
                    style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', color: 'var(--primary)' }}
                    disabled={forgotLoading}
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
