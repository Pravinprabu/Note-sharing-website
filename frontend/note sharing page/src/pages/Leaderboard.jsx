import React, { useState, useEffect } from 'react';
import { Award, Star, Download, TrendingUp, BookOpen } from 'lucide-react';
import { apiFetch, API_BASE } from '../utils/api';
import './Pages.css';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [topStudents, setTopStudents] = useState([]);
  const [topNotes, setTopNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          setTopStudents(data.top_students || []);
          setTopNotes(data.top_notes || []);
        }
      } catch (e) {
        console.error('Failed to load leaderboard', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="container py-12 page-fade-in">
      <div className="text-center mb-12">
        <div className="badge badge-primary mb-4" style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <TrendingUp size={16} /> Rankings
        </div>
        <h1>Campus Leaderboard</h1>
        <p className="text-secondary mt-2 max-w-2xl mx-auto">
          Recognizing the most helpful student contributors and highest-rated study resources at RMKEC.
        </p>
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
        {loading ? (
          <div className="text-center py-12 text-secondary">
            Calculating rankings...
          </div>
        ) : activeTab === 'students' ? (
          <div className="table-card glass-card" style={{ overflowX: 'auto' }}>
            <table className="w-full text-left" style={{ borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th className="py-4 px-6">Rank</th>
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6 text-center">Uploads</th>
                  <th className="py-4 px-6 text-center">Downloads</th>
                  <th className="py-4 px-6 text-center">Score</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-secondary">
                      No contributions recorded yet. Be the first to upload notes!
                    </td>
                  </tr>
                ) : topStudents.map((student, index) => (
                  <tr key={student.id || index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="py-4 px-6 font-bold" style={{ color: index < 3 ? 'var(--primary)' : 'var(--text-primary)' }}>
                      #{index + 1}
                      {index === 0 && <Award size={16} color="#F59E0B" style={{ display: 'inline', marginLeft: '0.5rem' }} />}
                    </td>
                    <td className="py-4 px-6 font-medium">{student.name}</td>
                    <td className="py-4 px-6 text-secondary">{student.dept || 'General'}</td>
                    <td className="py-4 px-6 text-center">{student.uploads}</td>
                    <td className="py-4 px-6 text-center">{student.downloads || 0}</td>
                    <td className="py-4 px-6 text-center font-bold" style={{ color: 'var(--primary)' }}>{student.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-card glass-card" style={{ overflowX: 'auto' }}>
            <table className="w-full text-left" style={{ borderCollapse: 'collapse', minWidth: '600px' }}>
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
                {topNotes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-secondary">No notes available yet.</td>
                  </tr>
                ) : topNotes.map((note, index) => (
                  <tr key={note.id || index} style={{ borderBottom: '1px solid var(--border-color)' }}>
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
                        <Star size={16} color="#F59E0B" fill="#F59E0B" /> {note.rating > 0 ? note.rating : '—'}
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
