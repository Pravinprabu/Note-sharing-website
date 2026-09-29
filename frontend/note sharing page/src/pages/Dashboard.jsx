import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, BookOpen, Star, Download, Heart, UserPlus, UserCheck, Sparkles, GraduationCap } from 'lucide-react';
import { apiFetch, getAuthToken, getStoredUser, API_BASE } from '../utils/api';
import './Dashboard.css';

const DEPARTMENTS = [
  'All', 
  'Science and Humanities', 
  'Information Technology', 
  'Computer Science and design', 
  'Electronics and Communication', 
  'Electronics and Electrical', 
  'Mechanical', 
  'Civil', 
  'ECE(ACT)', 
  'ECE(VLSI)'
];

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All'); // 'All' | '1st Year' | '2nd Year' | '3rd Year' | '4th Year'
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'popular' | 'rated'
  const [feedMode, setFeedMode] = useState('all'); // 'all' | 'following'
  
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [followingIds, setFollowingIds] = useState(new Set());
  const [savedNoteIds, setSavedNoteIds] = useState(new Set());
  const [ratingModalNote, setRatingModalNote] = useState(null);
  const [ratingInput, setRatingInput] = useState(5);

  // Handle department changes and synchronize year logic
  const handleDepartmentSelect = (dept) => {
    setSelectedDept(dept);
    if (dept === 'Science and Humanities') {
      setSelectedYear('1st Year');
    } else if (selectedYear === '1st Year') {
      setSelectedYear('All');
    }
  };

  // Available year options depending on selected department
  const availableYears = useMemo(() => {
    if (selectedDept === 'Science and Humanities') {
      return ['1st Year'];
    }
    if (selectedDept === 'All') {
      return ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];
    }
    // Specific Engineering Department
    return ['All', '2nd Year', '3rd Year', '4th Year'];
  }, [selectedDept]);

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

  // Fetch notes when department, year, sort, or feed mode changes
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
          if (selectedYear && selectedYear !== 'All') params.append('year', selectedYear);
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
  }, [selectedDept, selectedYear, sortBy, feedMode]);

  // Client-side search filtering across title, subject, uploader, department, year
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(note => 
      (note.title && note.title.toLowerCase().includes(q)) ||
      (note.subject && note.subject.toLowerCase().includes(q)) ||
      (note.uploader_name && note.uploader_name.toLowerCase().includes(q)) ||
      (note.department && note.department.toLowerCase().includes(q)) ||
      (note.year && note.year.toLowerCase().includes(q))
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
  const handleToggleFollow = async (targetUserId) => {
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
          <p className="text-secondary">Discover high-quality study materials segregated by department and year of study.</p>
        </div>
        
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              className="input search-input" 
              placeholder="Search by subject code, title, topic, or year..." 
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
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
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
                  const isActive = selectedDept === dept;
                  return (
                    <li key={index}>
                      <button 
                        className={`filter-btn ${isActive ? 'active' : ''}`}
                        onClick={() => handleDepartmentSelect(dept)}
                      >
                        {dept === 'Science and Humanities' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span>Science and Humanities</span>
                            <span 
                              style={{ 
                                fontSize: '0.72rem', 
                                padding: '0.15rem 0.45rem', 
                                borderRadius: '9999px', 
                                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.9)' : '#EEF2FF', 
                                color: '#4338CA', 
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                border: '1px solid #C7D2FE',
                                display: 'inline-block'
                              }}
                            >
                              (1st&nbsp;Year)
                            </span>
                          </span>
                        ) : (
                          dept
                        )}
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
          {/* Year of Study Filter Bar */}
          {feedMode === 'all' && (
            <div className="glass-card mb-6" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <GraduationCap size={20} color="var(--primary)" />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {selectedDept === 'Science and Humanities' 
                      ? '1st Year Foundation Notes' 
                      : selectedDept === 'All' 
                        ? 'Filter by Year of Study:' 
                        : `${selectedDept} • Year:`}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {availableYears.map(yearOpt => {
                    const isActive = selectedYear === yearOpt;
                    return (
                      <button
                        key={yearOpt}
                        onClick={() => setSelectedYear(yearOpt)}
                        className={`btn ${isActive ? 'btn-primary' : 'btn-outline'}`}
                        style={{
                          padding: '0.35rem 0.85rem',
                          fontSize: '0.825rem',
                          borderRadius: '9999px',
                          border: isActive ? 'none' : '1px solid var(--border-color)'
                        }}
                      >
                        {yearOpt === 'All' ? 'All Years' : yearOpt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Loading lecture notes...
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="empty-state text-center py-12 glass-card">
              <BookOpen size={48} className="text-secondary mx-auto mb-4" />
              <h3 className="mb-2">No notes found</h3>
              <p className="text-secondary mb-4">
                {feedMode === 'following' 
                  ? "You haven't followed any peers with notes yet. Explore all notes and follow contributors!" 
                  : `No notes available for ${selectedDept !== 'All' ? selectedDept : ''} ${selectedYear !== 'All' ? `(${selectedYear})` : ''}.`}
              </p>
              <a href="/upload" className="btn btn-primary">Share First Note for this Subject</a>
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
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '75%', minWidth: 0 }}>
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
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <p className="note-author" style={{ margin: 0, wordBreak: 'break-word' }}>By {note.uploader_name || 'Anonymous'}</p>
                      {!isAuthor && note.uploader_id && (
                        <button
                          onClick={() => handleToggleFollow(note.uploader_id)}
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
