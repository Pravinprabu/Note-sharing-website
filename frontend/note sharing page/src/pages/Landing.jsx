import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, Search } from 'lucide-react';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="badge badge-primary mb-4">For College Students</div>
            <h1 className="hero-title">Empower Your Learning with <span className="highlight">Shared Notes</span></h1>
            <p className="hero-subtitle">
              Struggling to understand complex concepts? Access high-quality, well-structured lecture notes shared by top students across all departments. Collaborate, learn, and succeed together.
            </p>
            <div className="hero-actions">
              <Link to="/dashboard" className="btn btn-primary btn-lg">Explore Notes</Link>
              <Link to="/signup" className="btn btn-outline btn-lg">Join the Club</Link>
            </div>
            
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">5K+</span>
                <span className="stat-label">Students</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Notes Shared</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">20+</span>
                <span className="stat-label">Departments</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="glass-card main-card">
              <BookOpen size={48} className="card-icon" />
              <h3>Data Structures PDF</h3>
              <p>By Alex M. • CS Dept</p>
              <div className="rating">⭐⭐⭐⭐⭐ 4.9</div>
            </div>
            <div className="glass-card secondary-card">
              <Award size={32} className="card-icon" />
              <h3>Top Contributor</h3>
              <p>Sarah J. (150+ notes)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features bg-surface">
        <div className="container">
          <div className="section-header text-center">
            <h2>Why Use Note Share?</h2>
            <p>Built exclusively to solve common difficulties college students face.</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <Search className="feature-icon" size={32} />
              <h3>Easy Discovery</h3>
              <p>Search notes by department, subject, or professor. Find exactly what you need to understand tough concepts.</p>
            </div>
            <div className="feature-card">
              <Users className="feature-icon" size={32} />
              <h3>Student Collaboration</h3>
              <p>Share your own well-structured notes and help your peers without any physical contact required.</p>
            </div>
            <div className="feature-card">
              <Award className="feature-icon" size={32} />
              <h3>Leaderboard & Ratings</h3>
              <p>Quality matters. Discover notes with the highest ratings and view top contributing students on the leaderboard.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
