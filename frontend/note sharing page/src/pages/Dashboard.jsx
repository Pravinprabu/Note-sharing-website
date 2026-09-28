import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, BookOpen, Star, Download, Heart, UserPlus, UserCheck, Sparkles, Check } from 'lucide-react';
import { apiFetch, getAuthToken, getStoredUser, API_BASE } from '../utils/api';
import './Dashboard.css';

const DEPARTMENTS = [
  'All', 
  'Information Technology', 
  'Computer Science and design', 
  'Electronics and Communication', 
  'Electronics and Electrical', 
  'Mechanical', 
  'Civil', 
  'Science and Humanities', 
  'ECE(ACT)', 
  'ECE(VLSI)'
];

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'popular' | 'rated'
  const [feedMode, setFeedMode] = useState('all'); // 'all' | 'following'
  
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [followingIds, setFollowingIds] = useState(new Set());
  const [savedNoteIds, setSavedNoteIds] = useState(new Set());
  const [ratingModalNote, setRatingModalNote] = useState(null);
  const [ratingInput, setRatingInput] = useState(5);

  // Refresh current user info & initial data
  useEffect(() => {
    const fetchUserData = async () => {
      const token = getAuthToken();
      if (!token) return;
      try {
        const res = await apiFetch('/api/users/me');
        if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
          setFollowingIds(new Set(user.following || []));
          setSavedNoteIds(new Set(user.saved_notes || []));
        }
      } catch (e) {
        console.error('Error fetching current user', e);
      }
    };
    fetchUserData();
  }, []);

  // Fetch notes when department, sort, or feed mode changes
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        let endpoint = '/api/notes';
        if (feedMode === 'following') {
          endpoint = '/api/notes/feed';
        } else {
          const params = new URLSearchParams();
          if (selectedDept && selectedDept !== 'All') params.append('dept', selectedDept);
          if (sortBy) params.append('sort', sortBy);
          if (params.toString()) {
            endpoint += `?${params.toString()}`;
          }
        }

        const response = await apiFetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setNotes(data);
        }
      } catch (error) {
        console.error('Failed to fetch notes', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [selectedDept, sortBy, feedMode]);

  // Client-side search filtering across title, subject, uploader, department
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(note => 
      (note.title && note.title.toLowerCase().includes(q)) ||
      (note.subject && note.subject.toLowerCase().includes(q)) ||
      (note.uploader_name && note.uploader_name.toLowerCase().includes(q)) ||
      (note.department && note.department.toLowerCase().includes(q))
    );
  }, [notes, searchQuery]);

  // Toggle Favorite
  const handleToggleFavorite = async (noteId) => {
    const token = getAuthToken();
    if (!token) {
      alert('Please log in to save notes to your favorites.');
      return;
    }

    try {
      const res = await apiFetch(`/api/notes/${noteId}/favorite`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSavedNoteIds(prev => {
          const next = new Set(prev);
          if (data.is_favorite) {
            next.add(noteId);
          } else {
            next.delete(noteId);
          }
          return next;
        });
      }
    } catch (e) {
      console.error('Error toggling favorite', e);
    }
  };

  // Toggle Follow
  const handleToggleFollow = async (targetUserId, targetName) => {
    const token = getAuthToken();
    if (!token) {
      alert('Please log in to follow students.');
      return;
    }

    try {
      const res = await apiFetch(`/api/users/${targetUserId}/follow`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setFollowingIds(prev => {
          const next = new Set(prev);
          if (data.is_following) {
            next.add(targetUserId);
          } else {
            next.delete(targetUserId);
          }
          return next;
        });
      }
    } catch (e) {
      console.error('Error toggling follow', e);
    }
  };

  // Submit Rating
  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!ratingModalNote) return;

    try {
      const res = await apiFetch(`/api/notes/${ratingModalNote._id}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rating: ratingInput })
      });
      if (res.ok) {
        const data = await res.json();
        // Update local note rating
        setNotes(prev => prev.map(n => {
          if (n._id === ratingModalNote._id) {
            return {
              ...n,
              average_rating: data.average_rating,
              rating_count: data.rating_count
            };
          }
          return n;
        }));
        setRatingModalNote(null);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to submit rating.');
      }
    } catch (e) {
      alert('Error submitting rating.');
    }
  };

  // Optimistic download counter update on view/download
  const handleDownloadClick = (noteId) => {
    setNotes(prev => prev.map(n => {
      if (n._id === noteId) {
        return { ...n, downloads: (n.downloads || 0) + 1 };
      }
      return n;
    }));
  };

  return (
    <div className="dashboard-page container pt-8 pb-12">
      {/* Header & Search */}
      <div className="dashboard-header">
        <div>
          <h1 className="mb-2">Explore Subject Notes</h1>
          <p className="text-secondary">Discover high-quality study materials shared by college peers.</p>
        </div>
        
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              className="input search-input" 
              placeholder="Search by subject, code, or topic..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && (
            <button 
              className="btn btn-outline" 
              onClick={() => setSearchQuery('')}
              style={{ height: '100%' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Feed Toggle (All vs Following) */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${feedMode === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFeedMode('all')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <BookOpen size={16} /> All Notes
        </button>
        <button 
          className={`btn ${feedMode === 'following' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => {
            if (!getAuthToken()) {
              alert('Please log in to view notes from followed students.');
              return;
            }
            setFeedMode('following');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Sparkles size={16} /> Following Feed
        </button>
      </div>

      <div className="dashboard-content">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          {feedMode === 'all' && (
            <div className="filter-section">
              <h3 className="filter-title">
                <Filter size={18} /> Departments
              </h3>
              <ul className="filter-list">
                {DEPARTMENTS.map((dept, index) => {
                  const isActive = selectedDept === dept || (dept === 'All' && !selectedDept);
                  return (
                    <li key={index}>
                      <button 
                        className={`filter-btn ${isActive ? 'active' : ''}`}
                        onClick={() => setSelectedDept(dept)}
                      >
                        {dept}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          
          <div className="filter-section mt-8">
            <h3 className="filter-title">Sort By</h3>
            <select 
              className="input mb-4" 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="recent">Recently Added</option>
              <option value="popular">Most Popular (Downloads)</option>
              <option value="rated">Highest Rated</option>
            </select>
          </div>
        </aside>

        {/* Main Grid */}
        <main className="notes-grid-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Loading lecture notes...
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="empty-state text-center py-12 glass-card">
              <BookOpen size={48} className="text-secondary mx-auto mb-4" />
              <h3 className="mb-2">No notes found</h3>
              <p className="text-secondary">
                {feedMode === 'following' 
                  ? "You haven't followed any creators with notes yet. Explore all notes and follow peers!" 
                  : "Try clearing your search query or choosing another department."}
              </p>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map(note => {
                const isFavorite = savedNoteIds.has(note._id);
                const isAuthor = currentUser && (currentUser.id === note.uploader_id || currentUser._id === note.uploader_id);
                const isFollowingAuthor = followingIds.has(note.uploader_id);

                return (
                  <div className="note-card" key={note._id}>
                    <div className="note-card-header">
                      <div className="note-icon-wrapper">
                        <BookOpen size={24} color="var(--primary)" />
                      </div>
                      <div className="note-badge">{note.department || 'General'}</div>
                    </div>
                    
                    <h3 className="note-title">{note.title || note.filename}</h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <p className="note-author" style={{ margin: 0 }}>By {note.uploader_name || 'Anonymous'}</p>
                      {!isAuthor && note.uploader_id && (
                        <button
                          onClick={() => handleToggleFollow(note.uploader_id, note.uploader_name)}
                          className="btn btn-ghost"
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.5rem',
                            height: 'auto',
                            color: isFollowingAuthor ? 'var(--primary)' : 'var(--text-secondary)'
                          }}
                          title={isFollowingAuthor ? 'Unfollow student' : 'Follow student'}
                        >
                          {isFollowingAuthor ? <><UserCheck size={13} /> Following</> : <><UserPlus size={13} /> Follow</>}
                        </button>
                      )}
                    </div>

                    {note.subject && (
                      <p className="text-secondary text-sm" style={{ marginBottom: '0.75rem' }}>
                        Subject: <strong style={{ color: 'var(--text-primary)' }}>{note.subject}</strong>
                      </p>
                    )}
                    
                    <div style={{ fontSize: '0.8rem', color: 'gray', marginBottom: '10px' }}>
                      {new Date(note.upload_date).toLocaleDateString()}
                    </div>
                    
                    <div className="note-stats">
                      <button 
                        onClick={() => {
                          if (!getAuthToken()) {
                            alert('Please log in to rate notes.');
                            return;
                          }
                          setRatingModalNote(note);
                          setRatingInput(Math.round(note.average_rating) || 5);
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        className="stat"
                        title="Click to rate this note"
                      >
                        <Star size={16} className="star-icon" fill={note.average_rating > 0 ? "#F59E0B" : "none"} /> 
                        {note.average_rating > 0 ? note.average_rating : 'Rate'} {note.rating_count ? `(${note.rating_count})` : ''}
                      </button>
                      
                      <span className="stat">
                        <Download size={16} /> {note.downloads || 0}
                      </span>
                    </div>
                    
                    <div className="note-card-footer">
                      <a 
                        href={`${API_BASE}/api/files/${note.file_id}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={() => handleDownloadClick(note._id)}
                        className="btn btn-outline w-full" 
                        style={{ justifyContent: 'center', display: 'flex', textDecoration: 'none' }}
                      >
                        View PDF
                      </a>
                      <button 
                        className="icon-btn" 
                        onClick={() => handleToggleFavorite(note._id)}
                        title={isFavorite ? "Remove from favorites" : "Save to favorites"}
                        style={{
                          backgroundColor: isFavorite ? '#FEE2E2' : 'transparent',
                          borderColor: isFavorite ? '#F87171' : 'var(--border-color)',
                          color: isFavorite ? '#EF4444' : 'var(--text-secondary)'
                        }}
                      >
                        <Heart size={20} fill={isFavorite ? "#EF4444" : "none"} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Rating Modal */}
      {ratingModalNote && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', backgroundColor: '#fff', borderRadius: 'var(--radius-lg)' }}>
            <h3 className="mb-2">Rate "{ratingModalNote.title}"</h3>
            <p className="text-secondary mb-4 text-sm">How helpful were these notes for your studies?</p>
            <form onSubmit={handleRatingSubmit}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRatingInput(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Star 
                      size={32} 
                      fill={star <= ratingInput ? '#F59E0B' : 'none'} 
                      color={star <= ratingInput ? '#F59E0B' : '#CBD5E1'} 
                    />
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  style={{ flex: 1 }} 
                  onClick={() => setRatingModalNote(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
