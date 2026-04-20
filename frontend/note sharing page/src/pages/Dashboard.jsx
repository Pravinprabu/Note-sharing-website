import React from 'react';
import { Search, Filter, BookOpen, Star, Download, Heart } from 'lucide-react';
import './Dashboard.css';

const MOCK_NOTES = [
  { id: 1, title: 'Data Structures & Algorithms', author: 'Alex M.', dept: 'Computer Science', subject: 'CS201', rating: 4.9, downloads: 1250 },
  { id: 2, title: 'Thermodynamics Final Prep', author: 'Sarah J.', dept: 'Mechanical Eng', subject: 'ME305', rating: 4.8, downloads: 980 },
  { id: 3, title: 'Macroeconomics Intro', author: 'David K.', dept: 'Economics', subject: 'ECO101', rating: 4.5, downloads: 750 },
  { id: 4, title: 'Organic Chemistry Reactions', author: 'Emily R.', dept: 'Chemistry', subject: 'CHM202', rating: 4.7, downloads: 1100 },
  { id: 5, title: 'Linear Algebra Matrices', author: 'Michael T.', dept: 'Mathematics', subject: 'MAT210', rating: 4.6, downloads: 640 },
  { id: 6, title: 'Modern Physics', author: 'Jessica L.', dept: 'Physics', subject: 'PHY301', rating: 4.9, downloads: 1500 },
];

const DEPARTMENTS = ['All', 'Computer Science', 'Mechanical Eng', 'Economics', 'Chemistry', 'Mathematics', 'Physics'];

const Dashboard = () => {
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
            {MOCK_NOTES.map(note => (
              <div className="note-card" key={note.id}>
                <div className="note-card-header">
                  <div className="note-icon-wrapper">
                    <BookOpen size={24} color="var(--primary)" />
                  </div>
                  <div className="note-badge">{note.subject}</div>
                </div>
                
                <h3 className="note-title">{note.title}</h3>
                <p className="note-author">By {note.author} • {note.dept}</p>
                
                <div className="note-stats">
                  <span className="stat"><Star size={16} className="star-icon" fill="currentColor" /> {note.rating}</span>
                  <span className="stat"><Download size={16} /> {note.downloads}</span>
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
