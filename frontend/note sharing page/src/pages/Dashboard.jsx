import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Star, Download, Heart } from 'lucide-react';
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
  
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/notes');
        if (response.ok) {
          const data = await response.json();
          setNotes(data);
        }
      } catch (error) {
        console.error('Failed to fetch notes', error);
      }
    }
    fetchNotes();
  }, []);

  return (
    <div className="dashboard-page container pt-8 pb-12">
      <div className="dashboard-header">
        <div>
          <h1 className="mb-2">Explore Subject Notes</h1>
          <p className="text-secondary">Discover high-quality study materials shared by your peers.</p>
        </div>
        
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              className="input search-input" 
              placeholder="Search by subject, code, or topic..." 
            />
          </div>
          <button className="btn btn-primary" style={{ height: '100%' }}>Search</button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="filter-section">
            <h3 className="filter-title">
              <Filter size={18} /> Departments
            </h3>
            <ul className="filter-list">
              {DEPARTMENTS.map((dept, index) => (
                <li key={index}>
                  <button className={`filter-btn ${index === 0 ? 'active' : ''}`}>
                    {dept}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="filter-section mt-8">
            <h3 className="filter-title">Sort By</h3>
            <select className="input mb-4">
              <option>Most Popular</option>
              <option>Highest Rated</option>
              <option>Recently Added</option>
            </select>
          </div>
        </aside>

        {/* Main Grid */}
        <main className="notes-grid-container">
          <div className="notes-grid">
            {notes.length === 0 ? (
                <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '2rem'}}>No notes available. Be the first to upload one!</div>
            ) : 
            notes.map(note => (
              <div className="note-card" key={note._id}>
                <div className="note-card-header">
                  <div className="note-icon-wrapper">
                    <BookOpen size={24} color="var(--primary)" />
                  </div>
                  <div className="note-badge">Notes</div>
                </div>
                
                <h3 className="note-title">{note.title || note.filename}</h3>
                <p className="note-author">By {note.uploader_name || 'Anonymous'}</p>
                <div style={{fontSize: '0.8rem', color: 'gray', marginBottom: '10px'}}>{new Date(note.upload_date).toLocaleDateString()}</div>
                
                <div className="note-stats">
                  <span className="stat"><Star size={16} className="star-icon" fill="currentColor" /> {4.5}</span>
                  <span className="stat"><Download size={16} /> {Math.floor(Math.random() * 100) + 1}</span>
                </div>
                
                <div className="note-card-footer">
                  <button className="btn btn-outline w-full" style={{ justifyContent: 'center' }}>
                    View PDF
                  </button>
                  <button className="icon-btn" title="Save to favorites">
                    <Heart size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
