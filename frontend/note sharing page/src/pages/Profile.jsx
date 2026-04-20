import React from 'react';
import { User, BookOpen, Star, Download, Settings } from 'lucide-react';
import './Pages.css';

const MOCK_MY_NOTES = [
  { id: 1, title: 'Data Structures Introduction', subject: 'CS201', rating: 4.8, downloads: 450, date: 'Oct 12, 2023' },
  { id: 2, title: 'Advanced Algorithms', subject: 'CS301', rating: 5.0, downloads: 320, date: 'Nov 05, 2023' },
];

const Profile = () => {
  return (
    <div className="container py-12 page-fade-in">
      <div className="profile-header">
        <div className="profile-info-card glass-card">
          <div className="profile-avatar">
            <User size={48} color="var(--primary)" />
          </div>
          <div className="profile-details">
            <h1>Alex Morgan</h1>
            <p className="text-secondary">Computer Science Department</p>
            <div className="profile-stats mt-4">
              <div className="stat-box">
                <span className="stat-val">2</span>
                <span className="stat-lbl">Uploads</span>
              </div>
              <div className="stat-box">
                <span className="stat-val">4.9</span>
                <span className="stat-lbl">Avg Rating</span>
              </div>
              <div className="stat-box">
                <span className="stat-val">770</span>
                <span className="stat-lbl">Total Downloads</span>
              </div>
            </div>
          </div>
          <button className="btn btn-outline edit-btn"><Settings size={18} /> Edit Profile</button>
        </div>
      </div>

      <div className="profile-content mt-8">
        <div className="section-header">
          <h2>Notes Shared by You</h2>
        </div>
        
        {MOCK_MY_NOTES.length > 0 ? (
          <div className="my-notes-grid">
            {MOCK_MY_NOTES.map(note => (
              <div className="my-note-card glass-card" key={note.id}>
                <div className="my-note-header">
                  <div className="note-badge">{note.subject}</div>
                  <span className="note-date">{note.date}</span>
                </div>
                <h3>{note.title}</h3>
                
                <div className="note-stats mt-4">
                  <span className="stat"><Star size={16} className="star-icon" fill="currentColor" /> {note.rating}</span>
                  <span className="stat"><Download size={16} /> {note.downloads} downloads</span>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button className="btn btn-primary" style={{ flex: 1 }}>Update file</button>
                  <button className="btn btn-outline" style={{ color: '#EF4444', borderColor: '#FEE2E2' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state text-center py-12 glass-card">
            <BookOpen size={48} className="text-secondary mx-auto mb-4" />
            <h3 className="mb-2">No notes shared yet</h3>
            <p className="text-secondary mb-4">Start contributing to the community to build your amazing profile.</p>
            <button className="btn btn-primary">Upload Your First Note</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
