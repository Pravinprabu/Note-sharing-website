import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, BookOpen, Star, Download, Trash2, Heart, Users, FileText } from 'lucide-react';
import { apiFetch, getAuthToken, API_BASE } from '../utils/api';
import './Pages.css';

const Profile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [myNotes, setMyNotes] = useState([]);
  const [savedNotes, setSavedNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' | 'saved'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    const loadProfileAndNotes = async () => {
      try {
        setLoading(true);
        // 1. Fetch current user profile
        const userRes = await apiFetch('/api/users/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          setProfileData(userData);

          // 2. Fetch notes uploaded by current user
          const notesRes = await apiFetch(`/api/notes?uploader_id=${userData.id}`);
          if (notesRes.ok) {
            const notes = await notesRes.json();
            setMyNotes(notes);
          }
        }

        // 3. Fetch saved notes
        const savedRes = await apiFetch('/api/notes/saved');
        if (savedRes.ok) {
          const saved = await savedRes.json();
          setSavedNotes(saved);
        }
      } catch (error) {
        console.error('Failed to load profile data', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileAndNotes();
  }, [navigate]);

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note permanently?')) {
      return;
    }

    try {
      const response = await apiFetch(`/api/notes/${noteId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setMyNotes(prev => prev.filter(note => note._id !== noteId));
        if (profileData) {
          setProfileData(prev => ({
            ...prev,
            uploads_count: Math.max(0, (prev.uploads_count || 1) - 1)
          }));
        }
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to delete note');
      }
    } catch (error) {
      alert('Error connecting to server to delete note.');
    }
  };

  const handleRemoveSaved = async (noteId) => {
    try {
      const response = await apiFetch(`/api/notes/${noteId}/favorite`, {
        method: 'POST'
      });
      if (response.ok) {
        setSavedNotes(prev => prev.filter(n => n._id !== noteId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <p className="text-secondary">Loading profile details...</p>
      </div>
    );
  }

  const user = profileData || {
    name: 'Student',
    email: '',
    department: '',
    uploads_count: myNotes.length,
    followers_count: 0,
    following_count: 0,
    total_downloads: 0,
    avg_rating: 0.0
  };

  return (
    <div className="container py-12 page-fade-in">
      <div className="profile-header">
        <div className="profile-info-card glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div className="profile-avatar">
              <User size={44} color="var(--primary)" />
            </div>
            <div className="profile-details">
              <h1 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>{user.name}</h1>
              <p className="text-secondary" style={{ marginBottom: '0.25rem', wordBreak: 'break-all' }}>{user.email}</p>
              {user.department && (
                <span className="badge badge-primary" style={{ display: 'inline-block', marginTop: '0.25rem' }}>
                  {user.department}
                </span>
              )}
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-box">
              <div className="stat-val">{user.uploads_count ?? myNotes.length}</div>
              <div className="stat-lbl">Uploads</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">{user.followers_count || 0}</div>
              <div className="stat-lbl">Followers</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">{user.following_count || 0}</div>
              <div className="stat-lbl">Following</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">{user.total_downloads || 0}</div>
              <div className="stat-lbl">Downloads</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">
                {user.avg_rating > 0 ? user.avg_rating : '—'}
              </div>
              <div className="stat-lbl">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs mt-8 flex justify-center mb-6">
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'uploads' ? 'active' : ''}`}
            onClick={() => setActiveTab('uploads')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FileText size={16} /> My Shared Notes ({myNotes.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Heart size={16} /> Saved Notes ({savedNotes.length})
          </button>
        </div>
      </div>

      <div className="profile-content">
        {activeTab === 'uploads' && (
          <div>
            {myNotes.length > 0 ? (
              <div className="notes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {myNotes.map(note => (
                  <div className="note-card glass-card" key={note._id}>
                    <div className="note-card-header">
                      <div className="note-icon-wrapper">
                        <BookOpen size={24} color="var(--primary)" />
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '70%' }}>
                        {note.year && (
                          <span 
                            className="badge" 
                            style={{ 
                              backgroundColor: '#EEF2FF', 
                              color: '#4338CA', 
                              fontWeight: 600,
                              border: '1px solid #C7D2FE' 
                            }}
                          >
                            {note.year}
                          </span>
                        )}
                        <span className="note-badge">{note.department || 'General'}</span>
                      </div>
                    </div>
                    
                    <h3 className="note-title">{note.title || note.filename}</h3>
                    {note.subject && <p className="text-secondary text-sm mb-2">Subject: {note.subject}</p>}
                    <div style={{ fontSize: '0.8rem', color: 'gray', marginBottom: '10px' }}>
                      Uploaded on {new Date(note.upload_date).toLocaleDateString()}
                    </div>
                    
                    <div className="note-stats">
                      <span className="stat">
                        <Star size={16} className="star-icon" fill="#F59E0B" color="#F59E0B" /> {note.average_rating || 0}
                      </span>
                      <span className="stat">
                        <Download size={16} /> {note.downloads || 0}
                      </span>
                    </div>
                    
                    <div className="note-card-footer mt-4" style={{ display: 'flex', gap: '0.5rem' }}>
                      <a 
                        href={`${API_BASE}/api/files/${note.file_id}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-outline" 
                        style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                      >
                        View File
                      </a>
                      <button 
                        onClick={() => handleDeleteNote(note._id)} 
                        className="btn btn-outline" 
                        title="Delete note"
                        style={{ color: '#EF4444', borderColor: '#FEE2E2', padding: '0.5rem' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state text-center py-12 glass-card">
                <BookOpen size={48} className="text-secondary mx-auto mb-4" />
                <h3 className="mb-2">No notes shared yet</h3>
                <p className="text-secondary mb-4">Start contributing to the college repository to earn ranks on the leaderboard.</p>
                <Link to="/upload" className="btn btn-primary">Upload Your First Note</Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            {savedNotes.length > 0 ? (
              <div className="notes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {savedNotes.map(note => (
                  <div className="note-card glass-card" key={note._id}>
                    <div className="note-card-header">
                      <div className="note-icon-wrapper">
                        <BookOpen size={24} color="var(--primary)" />
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '70%' }}>
                        {note.year && (
                          <span 
                            className="badge" 
                            style={{ 
                              backgroundColor: '#EEF2FF', 
                              color: '#4338CA', 
                              fontWeight: 600,
                              border: '1px solid #C7D2FE' 
                            }}
                          >
                            {note.year}
                          </span>
                        )}
                        <span className="note-badge">{note.department || 'Notes'}</span>
                      </div>
                    </div>
                    
                    <h3 className="note-title">{note.title || note.filename}</h3>
                    <p className="note-author">By {note.uploader_name || 'Anonymous'}</p>
                    {note.subject && <p className="text-secondary text-sm mb-2">{note.subject}</p>}
                    
                    <div className="note-stats">
                      <span className="stat">
                        <Star size={16} fill="#F59E0B" color="#F59E0B" /> {note.average_rating || 0}
                      </span>
                      <span className="stat">
                        <Download size={16} /> {note.downloads || 0}
                      </span>
                    </div>
                    
                    <div className="note-card-footer mt-4" style={{ display: 'flex', gap: '0.5rem' }}>
                      <a 
                        href={`${API_BASE}/api/files/${note.file_id}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-primary" 
                        style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                      >
                        View File
                      </a>
                      <button 
                        onClick={() => handleRemoveSaved(note._id)} 
                        className="btn btn-outline" 
                        title="Remove from saved"
                        style={{ color: '#EF4444', borderColor: '#FEE2E2', padding: '0.5rem' }}
                      >
                        <Heart size={18} fill="#EF4444" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state text-center py-12 glass-card">
                <Heart size={48} className="text-secondary mx-auto mb-4" />
                <h3 className="mb-2">No saved notes</h3>
                <p className="text-secondary mb-4">Click the heart icon on any note in the Explore page to bookmark it here.</p>
                <Link to="/dashboard" className="btn btn-primary">Browse Explore Feed</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
