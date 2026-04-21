import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
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
      const response = await fetch('http://localhost:5000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullname, email, password })
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
            <input type="text" id="fullname" className="input" placeholder="Alex Morgan" required value={fullname} onChange={e => setFullname(e.target.value)} />
          </div>
          
          <div className="input-group">
            <label htmlFor="department">Department</label>
            <select id="department" className="input" required value={department} onChange={e => setDepartment(e.target.value)}>
               <option value="" disabled>Select your department</option>
               <option value="it">Information Technology</option>
               <option value="csd">Computer Science and design</option>
               <option value="ece">Electronics and Communication</option>
               <option value="eee">Electronics and Electrical</option>
               <option value="mech">Mechanical</option>
               <option value="civil">Civil</option>
               <option value="sh">Science and Humanities</option>
               <option value="ece_act">ECE(ACT)</option>
               <option value="ece_vlsi">ECE(VLSI)</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="email">College Email</label>
            <input type="email" id="email" className="input" placeholder="student@college.edu" required value={email} onChange={e => setEmail(e.target.value)} />
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
