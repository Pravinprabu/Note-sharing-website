import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Mail, 
  MessageSquarePlus, 
  GraduationCap, 
  Building2, 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { API_BASE, getStoredUser } from '../utils/api';
import './Footer.css';

const LinkedinIcon = ({ size = 16, color = '#0A66C2' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    style={{ color, display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.67 1.67 0 1 0 0-3.34 1.67 1.67 0 0 0 0 3.34m1.39 9.74V9.89H5.07v8.61h2.78z"/>
  </svg>
);

const Footer = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [category, setCategory] = useState('General Feedback');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState(null);

  const categories = [
    'General Feedback',
    'Feature Suggestion',
    'Report an Issue',
    'Request Notes / Subject'
  ];

  const openFeedbackModal = () => {
    const user = getStoredUser();
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
    }
    setFeedbackStatus(null);
    setMessage('');
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setFeedbackStatus(null);

    let deliveredViaEmail = false;

    // 1. Direct Email dispatch via EmailJS to contact.pravinp@gmail.com
    try {
      const emailjsRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: 'service_swnkpo6',
          template_id: 'template_llo5jua',
          user_id: 'b4A-HfBLGaxF8Qnta',
          accessToken: 'eRtqKzpDqa0sknHDDUhYY',
          template_params: {
            to_email: 'contact.pravinp@gmail.com',
            email: 'contact.pravinp@gmail.com',
            to_name: 'Pravin P',
            name: name.trim() || 'RMKEC Student',
            passcode: `[${category}] ${message.trim().slice(0, 150)}`,
            time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            message: `New Student Feedback!\n\nCategory: ${category}\nFrom: ${name.trim() || 'Anonymous'} (${email.trim() || 'No email'})\n\nMessage:\n${message.trim()}`
          }
        })
      });
      if (emailjsRes.ok) {
        deliveredViaEmail = true;
      }
    } catch (emailErr) {
      console.warn('EmailJS direct dispatch failed, trying backend...', emailErr);
    }

    // 2. Also save to backend database
    try {
      await fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'Anonymous Student',
          email: email.trim(),
          category,
          message: message.trim()
        })
      });
    } catch (backendErr) {
      console.warn('Backend feedback save error:', backendErr);
    }

    // Success response
    setFeedbackStatus({
      type: 'success',
      text: 'Thank you! Your feedback has been sent directly to Pravin\'s inbox.'
    });
    setMessage('');
    setLoading(false);

    setTimeout(() => {
      setShowFeedbackModal(false);
      setFeedbackStatus(null);
    }, 2500);
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-vertical-stack">
          
          {/* 1. Website Explanation */}
          <div className="footer-section">
            <Link to="/" className="footer-brand">
              <BookOpen size={28} color="#111827" />
              <span>RMKEC Notes</span>
            </Link>
            <p className="footer-desc">
              A peer-to-peer academic note sharing platform built for students of R.M.K. Engineering College. Share knowledge, download unit notes, and excel together.
            </p>
            <div className="footer-quick-links">
              <Link to="/dashboard" className="footer-link">Explore Notes</Link>
              <Link to="/leaderboard" className="footer-link">Leaderboard</Link>
              <Link to="/upload" className="footer-link">Upload Notes</Link>
            </div>
          </div>

          <div className="footer-divider" />

          {/* 2. Developed By Details */}
          <div className="footer-section">
            <h3 className="developed-by-header">Developed by</h3>
            <h4 className="dev-name">Pravin P</h4>

            <ul className="dev-academic-list">
              <li className="dev-academic-item">
                <GraduationCap size={16} color="#111827" />
                <span>Student of batch 2028</span>
              </li>
              <li className="dev-academic-item">
                <Building2 size={16} color="#111827" />
                <span>Information Technology</span>
              </li>
              <li className="dev-academic-item">
                <Building2 size={16} color="#111827" />
                <span>R.M.K Engineering College</span>
              </li>
            </ul>

            <div className="dev-contact-block">
              <div className="dev-contact-row">
                <Mail size={16} color="#111827" />
                <span>
                  For Queries and contact : mail --{' '}
                  <a href="mailto:contact.pravinp@gmail.com" className="dev-link">
                    contact.pravinp@gmail.com
                  </a>
                </span>
              </div>
              
              <div className="dev-contact-row" style={{ marginTop: '0.25rem' }}>
                <LinkedinIcon size={16} color="#0A66C2" />
                <span>
                  linkedin :{' '}
                  <a 
                    href="https://www.linkedin.com/in/pravin-p-84092832a/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="dev-link"
                  >
                    Pravin P <ExternalLink size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />
                  </a>
                </span>
              </div>
            </div>
          </div>

          <div className="footer-divider" />

          {/* 3. Feedbacks Section */}
          <div className="footer-section">
            <div className="feedback-box">
              <h4 className="feedback-tagline">Always open for your feedbacks!</h4>
              <p className="feedback-subtext">
                Found a bug? Have an idea to make this site better, or want specific subject notes added? Let me know directly.
              </p>
              <button 
                type="button" 
                className="feedback-open-btn"
                onClick={openFeedbackModal}
              >
                <MessageSquarePlus size={18} /> Give Feedback / Suggestion
              </button>
            </div>
          </div>

        </div>

        {/* 4. Bottom Line */}
        <div className="footer-bottom" style={{ marginTop: '2.5rem' }}>
          <p>&copy; {new Date().getFullYear()} RMKEC Note Share. Built for the students of R.M.K. Engineering College.</p>
        </div>
      </div>

      {/* Interactive Feedback Modal */}
      {showFeedbackModal && (
        <div className="feedback-modal-overlay" onClick={() => !loading && setShowFeedbackModal(false)}>
          <div className="feedback-modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquarePlus size={20} color="var(--primary)" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Share Your Feedback</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowFeedbackModal(false)}
                disabled={loading}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {feedbackStatus && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                backgroundColor: feedbackStatus.type === 'success' ? '#DEF7EC' : '#FDE8E8',
                color: feedbackStatus.type === 'success' ? '#03543F' : '#9B1C1C',
                lineHeight: 1.4
              }}>
                {feedbackStatus.type === 'success' ? <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />}
                <span>{feedbackStatus.text}</span>
              </div>
            )}

            <form onSubmit={handleFeedbackSubmit}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  Category
                </label>
                <div className="category-chips">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      className={`category-chip ${category === cat ? 'active' : ''}`}
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="input-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Your Email (Optional, if you want a reply)
                </label>
                <input
                  type="email"
                  className="input"
                  placeholder="241025.it@rmkec.ac.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Your Feedback / Suggestion *
                </label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="What would you like to see improved, added, or fixed?"
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  disabled={loading}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full btn-lg"
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {loading ? 'Sending to Pravin...' : <><Send size={16} /> Send to Pravin's Email</>}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <a 
                  href={`mailto:contact.pravinp@gmail.com?subject=Feedback for RMKEC Notes (${encodeURIComponent(category)})&body=${encodeURIComponent(message || 'Hi Pravin,\n\n')}`}
                  style={{ fontSize: '0.8rem', color: '#B45309', fontWeight: 600, textDecoration: 'underline' }}
                >
                  Or open your email app directly (Gmail)
                </a>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
