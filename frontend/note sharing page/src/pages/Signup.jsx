import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { API_BASE } from '../utils/api';
import './Auth.css';

const Signup = () => {
  const [fullname, setFullname] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!email.endsWith('@rmkec.ac.in')) {
      setMessage('Please register using your college email (@rmkec.ac.in)');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullname, email, password, department })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Account created successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage(data.message || 'Signup failed.');
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
        <h2 className="mb-2">Create an Account</h2>
        <p className="text-secondary mb-4">Join the club and start sharing knowledge today.</p>
        
        {message && <p style={{color: message.includes('success') ? 'green' : 'red', marginBottom: '10px'}}>{message}</p>}

        <form className="auth-form" onSubmit={handleSignup}>
          <div className="input-group">
            <label htmlFor="fullname">Full Name</label>
            <input type="text" id="fullname" className="input" placeholder="(eg: Rahul Sharma)" required value={fullname} onChange={e => setFullname(e.target.value)} />
          </div>
          
          <div className="input-group">
            <label htmlFor="department">Department</label>
            <select id="department" className="input" required value={department} onChange={e => setDepartment(e.target.value)}>
               <option value="" disabled>Select your department</option>
               <option value="Information Technology">Information Technology</option>
               <option value="Computer Science and design">Computer Science and design</option>
               <option value="Electronics and Communication">Electronics and Communication</option>
               <option value="Electronics and Electrical">Electronics and Electrical</option>
               <option value="Mechanical">Mechanical</option>
               <option value="Civil">Civil</option>
               <option value="Science and Humanities">Science and Humanities</option>
               <option value="ECE(ACT)">ECE(ACT)</option>
               <option value="ECE(VLSI)">ECE(VLSI)</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="email">College Email</label>
            <input type="email" id="email" className="input" placeholder="(eg: 241025.it@rmkec.ac.in or 24it1025@rmkec.ac.in)" required value={email} onChange={e => setEmail(e.target.value)} />
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              e.g. <strong>241025.it@rmkec.ac.in</strong> or <strong>24it1025@rmkec.ac.in</strong>
            </span>
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" className="input" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          
          <button type="submit" className="btn btn-primary w-full btn-lg mt-4">Sign Up</button>
        </form>
        
        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
