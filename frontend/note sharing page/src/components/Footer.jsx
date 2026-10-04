import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Mail, 
  MessageSquarePlus, 
  GraduationCap, 
  Building2, 
  Sparkles, 
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

    try {
      const response = await fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'Anonymous Student',
          email: email.trim(),
          category,
          message: message.trim()
        })
      });

      const data = await response.json();
      if (response.ok) {
        setFeedbackStatus({
          type: 'success',
          text: data.message || 'Thank you! Your feedback has been received.'
        });
        setMessage('');
        setTimeout(() => {
          setShowFeedbackModal(false);
          setFeedbackStatus(null);
        }, 2200);
      } else {
        setFeedbackStatus({
          type: 'error',
          text: data.message || 'Failed to submit feedback. Please try again.'
        });
      }
    } catch (err) {
      setFeedbackStatus({
        type: 'error',
        text: 'Could not connect to server. You can also mail directly to contact.pravinp@gmail.com'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Column 1: Platform Overview */}
          <div className="footer-col">
            <Link to="/" className="footer-brand">
              <BookOpen size={24} color="var(--primary)" />
              <span>RMKEC Notes</span>
            </Link>
            <p className="footer-desc">
              A peer-to-peer academic note sharing platform built for students of R.M.K. Engineering College. Share knowledge, download unit notes, and excel together.
            </p>
            <div className="footer-quick-links">
              <Link to="/dashboard" className="footer-link">Explore Notes</Link>
              <span>•</span>
              <Link to="/leaderboard" className="footer-link">Leaderboard</Link>
              <span>•</span>
              <Link to="/upload" className="footer-link">Upload Notes</Link>
            </div>
          </div>

          {/* Column 2: Developer Details */}
          <div className="footer-col">
            <div className="dev-badge">
              <Sparkles size={12} /> Developed by
            </div>
            <h4 className="dev-name">Pravin P</h4>
            <ul className="dev-details">
              <li>
                <GraduationCap size={15} color="var(--primary)" />
                <span>Student of batch 2028</span>
              </li>
              <li>
                <Building2 size={15} color="var(--text-secondary)" />
                <span>Information Technology</span>
              </li>
              <li>
                <Building2 size={15} color="var(--text-secondary)" />
                <span>R.M.K Engineering College</span>
              </li>
            </ul>

            <div className="dev-connect-list">
              <div className="dev-connect-item">
                <Mail size={15} color="var(--primary)" />
                <span>
                  For Queries and contact : mail --{' '}
                  <a href="mailto:contact.pravinp@gmail.com">contact.pravinp@gmail.com</a>
                </span>
              </div>
              <div className="dev-connect-item">
                <LinkedinIcon size={16} color="#0A66C2" />
                <span>
                  linkedin :{' '}
                  <a 
                    href="https://www.linkedin.com/in/pravin-p-84092832a/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Pravin P <ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: Feedbacks & Interactive Action */}
          <div className="footer-col">
            <div className="feedback-card">
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

        {/* Footer Bottom Line */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} RMKEC Note Share. Built for the students of R.M.K. Engineering College.</p>
          <p>
            Developed by <strong>Pravin P</strong> (IT • Batch 2028)
          </p>
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
                color: feedbackStatus.type === 'success' ? '#03543F' : '#9B1C1C'
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
                {loading ? 'Sending Feedback...' : <><Send size={16} /> Submit Feedback</>}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.85rem' }}>
                Or mail me directly anytime at <a href="mailto:contact.pravinp@gmail.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>contact.pravinp@gmail.com</a>
              </p>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
