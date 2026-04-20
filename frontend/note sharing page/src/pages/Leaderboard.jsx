import React, { useState } from 'react';
import { Award, Star, Download, TrendingUp } from 'lucide-react';
import './Pages.css';

const TOP_STUDENTS = [
  { id: 1, name: 'Sarah J.', dept: 'Mechanical Eng', uploads: 24, downloads: 4500, score: 980 },
  { id: 2, name: 'Alex M.', dept: 'Computer Science', uploads: 18, downloads: 3800, score: 850 },
  { id: 3, name: 'David K.', dept: 'Economics', uploads: 15, downloads: 2100, score: 720 },
  { id: 4, name: 'Jessica L.', dept: 'Physics', uploads: 12, downloads: 3200, score: 680 },
  { id: 5, name: 'Emily R.', dept: 'Chemistry', uploads: 9, downloads: 1500, score: 450 },
];

const TOP_NOTES = [
  { id: 1, title: 'Data Structures & Algorithms Mastery', author: 'Alex M.', subject: 'CS201', rating: 4.9, downloads: 2100 },
  { id: 2, title: 'Quantum Mechanics Visualized', author: 'Jessica L.', subject: 'PHY301', rating: 4.9, downloads: 1850 },
  { id: 3, title: 'Macroeconomics Cheat Sheet', author: 'David K.', subject: 'ECO101', rating: 4.8, downloads: 1500 },
  { id: 4, title: 'Fluid Mechanics Notes', author: 'Sarah J.', subject: 'ME201', rating: 4.7, downloads: 1200 },
];

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('students');

  return (
    <div className="container py-12 page-fade-in">
      <div className="text-center mb-12">
        <div className="badge badge-primary mb-4" style={{ margin: '0 auto' }}><TrendingUp size={16} /> Rankings</div>
        <h1>Leaderboards</h1>
        <p className="text-secondary mt-2 max-w-2xl mx-auto">Discover the most helpful contributors and the highest-rated study materials in the college.</p>
      </div>

      <div className="tabs-container flex justify-center mb-8">
        <div className="tabs glass-card" style={{ display: 'inline-flex', padding: '0.5rem', borderRadius: 'var(--radius-lg)' }}>
          <button 
            className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Top Contributors
          </button>
          <button 
            className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
             Top Rated Notes
          </button>
        </div>
      </div>

      <div className="leaderboard-content max-w-4xl mx-auto" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {activeTab === 'students' && (
          <div className="table-card glass-card">
            <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th className="py-4 px-6">Rank</th>
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6 text-center">Uploads</th>
                  <th className="py-4 px-6 text-center">Score</th>
                </tr>
              </thead>
              <tbody>
                {TOP_STUDENTS.map((student, index) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="hover:bg-surface">
                    <td className="py-4 px-6 font-bold" style={{ color: index < 3 ? 'var(--primary)' : 'var(--text-primary)' }}>
                      #{index + 1}
                      {index === 0 && <Award size={16} style={{ display: 'inline', marginLeft: '0.5rem' }} />}
                    </td>
                    <td className="py-4 px-6 font-medium">{student.name}</td>
                    <td className="py-4 px-6 text-secondary">{student.dept}</td>
                    <td className="py-4 px-6 text-center">{student.uploads}</td>
                    <td className="py-4 px-6 text-center font-bold">{student.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="table-card glass-card">
            <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th className="py-4 px-6">Rank</th>
                  <th className="py-4 px-6">Note Title</th>
                  <th className="py-4 px-6">Author</th>
                  <th className="py-4 px-6 text-center">Rating</th>
                  <th className="py-4 px-6 text-center">Downloads</th>
                </tr>
              </thead>
              <tbody>
                {TOP_NOTES.map((note, index) => (
                  <tr key={note.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="py-4 px-6 font-bold" style={{ color: index < 3 ? 'var(--primary)' : 'var(--text-primary)' }}>
                      #{index + 1}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium">{note.title}</div>
                      <div className="text-secondary text-sm">{note.subject}</div>
                    </td>
                    <td className="py-4 px-6">{note.author}</td>
                    <td className="py-4 px-6 text-center">
                       <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                         <Star size={16} color="#F59E0B" fill="#F59E0B" /> {note.rating}
                       </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                        <Download size={16} color="var(--text-secondary)" /> {note.downloads}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
