import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import './Auth.css';

const Signup = () => {
  return (
    <div className="auth-page">
      <div className="auth-card glass-card text-center">
        <Link to="/" className="auth-logo">
          <BookOpen size={32} color="var(--primary)" />
        </Link>
        <h2 className="mb-2">Create an Account</h2>
        <p className="text-secondary mb-4">Join the club and start sharing knowledge today.</p>
        
        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <div className="input-group">
            <label htmlFor="fullname">Full Name</label>
            <input type="text" id="fullname" className="input" placeholder="Alex Morgan" required />
          </div>
          
          <div className="input-group">
            <label htmlFor="department">Department</label>
            <select id="department" className="input" required>
               <option value="" disabled selected>Select your department</option>
               <option value="cs">Computer Science</option>
               <option value="mech">Mechanical Engineering</option>
               <option value="eco">Economics</option>
               <option value="chem">Chemistry</option>
               <option value="math">Mathematics</option>
               <option value="phy">Physics</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="email">College Email</label>
            <input type="email" id="email" className="input" placeholder="student@college.edu" required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" className="input" placeholder="••••••••" required />
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
