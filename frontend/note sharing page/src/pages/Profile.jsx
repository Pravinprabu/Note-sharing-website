import React, { useState, useEffect } from 'react';
import { User, BookOpen, Star, Download, Settings } from 'lucide-react';
import './Pages.css';

const Profile = () => {
  const [myNotes, setMyNotes] = useState([]);
  const [user, setUser] = useState({ name: 'Guest', email: '' });

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchMyNotes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/notes');
        if (response.ok) {
          const data = await response.json();
          // Filter notes by the current user
          const filtered = data.filter(note => note.uploader_name === (storedUser ? JSON.parse(storedUser).name : ''));
          setMyNotes(filtered);
        }
      } catch (error) {
        console.error('Failed to fetch notes', error);
      }
    }
    fetchMyNotes();
  }, []);
    <div className="container py-12 page-fade-in">
      <div className="profile-header">
        <div className="profile-info-card glass-card">
          <div className="profile-avatar">
            <User size={48} color="var(--primary)" />
          </div>
          <div className="profile-details">
            <h1>{user.name}</h1>
            <p className="text-secondary">{user.email}</p>
            <div className="profile-stats mt-4">
              <div className="stat-box">
                <span className="stat-val">{myNotes.length}</span>
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
        
        {myNotes.length > 0 ? (
          <div className="my-notes-grid">
            {myNotes.map(note => (
              <div className="my-note-card glass-card" key={note._id}>
                <div className="my-note-header">
                  <div className="note-badge">Notes</div>
                  <span className="note-date">{new Date(note.upload_date).toLocaleDateString()}</span>
                </div>
                <h3>{note.title || note.filename}</h3>
                
                <div className="note-stats mt-4">
                  <span className="stat"><Star size={16} className="star-icon" fill="currentColor" /> 4.5</span>
                  <span className="stat"><Download size={16} /> 0 downloads</span>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <a href={`http://localhost:5000/api/files/${note.file_id}`} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>View file</a>
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
