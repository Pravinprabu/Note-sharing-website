import React, { useState } from 'react';
import { UploadCloud, File, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiFetch, getAuthToken } from '../utils/api';
import './Pages.css';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [dept, setDept] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleYearChange = (selectedYear) => {
    setYear(selectedYear);
    if (selectedYear === '1st Year') {
      setDept('Science and Humanities');
    } else if (dept === 'Science and Humanities') {
      setDept('');
    }
  };

  const handleDeptChange = (selectedDept) => {
    setDept(selectedDept);
    if (selectedDept === 'Science and Humanities') {
      setYear('1st Year');
    } else if (year === '1st Year') {
      setYear('2nd Year');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      const name = droppedFile.name.toLowerCase();
      if (name.endsWith('.pdf') || name.endsWith('.zip')) {
        setFile(droppedFile);
        setMessage('');
      } else {
        setMessage('Only PDF and ZIP files are allowed.');
        setIsSuccess(false);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    
    if (!token) {
      setMessage('You must be logged in to upload files.');
      setIsSuccess(false);
      return;
    }

    if (!file) {
      setMessage('Please select a file to upload.');
      setIsSuccess(false);
      return;
    }

    if (!year) {
      setMessage('Please select the Year of Study.');
      setIsSuccess(false);
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('year', year);
    formData.append('dept', dept);
    formData.append('subject', subject);
    
    try {
      const response = await apiFetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Notes uploaded and shared successfully!');
        setIsSuccess(true);
        setFile(null);
        setTitle('');
        setYear('');
        setDept('');
        setSubject('');
      } else {
        setMessage(data.message || 'Upload failed.');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Error connecting to server. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-12 page-fade-in flex justify-center">
      <div className="upload-container glass-card">
        <h1 className="mb-2">Upload Lecture Notes</h1>
        <p className="text-secondary mb-8">Share your study materials segregated by year and department.</p>
        
        {message && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            backgroundColor: isSuccess ? '#DEF7EC' : '#FDE8E8',
            color: isSuccess ? '#03543F' : '#9B1C1C'
          }}>
            {isSuccess ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleUpload}>
          {/* Dropzone */}
          <div 
            className="upload-dropzone mb-8 text-center" 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ 
              border: isDragging ? '2px dashed var(--primary)' : '2px dashed #CBD5E1', 
              backgroundColor: isDragging ? 'var(--primary-light)' : '#F8FAFC'
            }}
          >
            <input 
              type="file" 
              accept=".pdf,.zip" 
              onChange={handleFileChange} 
              style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} 
            />
            {file ? (
              <>
                <File size={48} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
                <h3 className="mb-2">{file.name}</h3>
                <p className="text-secondary text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB • Click or drop to replace</p>
              </>
            ) : (
              <>
                <UploadCloud size={48} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
                <h3 className="mb-2">Drag and drop file here, or click to browse</h3>
                <p className="text-secondary mb-4">Select lecture notes from your computer</p>
                <p className="text-secondary text-sm">Supported formats: PDF, ZIP (Max 10MB)</p>
              </>
            )}
          </div>
          
          {/* Note Title */}
          <div className="input-group">
            <label htmlFor="title">Note Title</label>
            <input 
              type="text" 
              id="title" 
              className="input" 
              placeholder="e.g. Complete Unit 1 to 5 Graph Theory Notes" 
              required 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
            />
          </div>
          
          {/* Year & Department Grid */}
          <div className="grid-2 gap-4 mb-4">
            <div className="input-group">
              <label htmlFor="year">Year of Study</label>
              <select 
                id="year" 
                className="input" 
                required 
                value={year} 
                onChange={e => handleYearChange(e.target.value)}
              >
                 <option value="" disabled>Select Year</option>
                 <option value="1st Year">1st Year (Common Foundation)</option>
                 <option value="2nd Year">2nd Year</option>
                 <option value="3rd Year">3rd Year</option>
                 <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="dept">Department</label>
              <select 
                id="dept" 
                className="input" 
                required 
                value={dept} 
                onChange={e => handleDeptChange(e.target.value)}
                disabled={year === '1st Year'}
              >
                 <option value="" disabled>Select department</option>
                 {year === '1st Year' ? (
                   <option value="Science and Humanities">Science and Humanities</option>
                 ) : (
                   <>
                     <option value="Information Technology">Information Technology</option>
                     <option value="Computer Science and design">Computer Science and design</option>
                     <option value="Electronics and Communication">Electronics and Communication</option>
                     <option value="Electronics and Electrical">Electronics and Electrical</option>
                     <option value="Mechanical">Mechanical</option>
                     <option value="Civil">Civil</option>
                     <option value="Science and Humanities">Science and Humanities</option>
                     <option value="ECE(ACT)">ECE(ACT)</option>
                     <option value="ECE(VLSI)">ECE(VLSI)</option>
                   </>
                 )}
              </select>
            </div>
          </div>

          {year === '1st Year' && (
            <p className="text-secondary text-sm mb-4" style={{ color: '#2563EB' }}>
              💡 All 1st-year courses across branches belong to Science and Humanities.
            </p>
          )}

          {/* Subject Code / Name */}
          <div className="input-group">
            <label htmlFor="subject">Subject Code & Name</label>
            <input 
              type="text" 
              id="subject" 
              className="input" 
              placeholder="e.g. IT8302 / Data Structures or PH3151 / Engineering Physics" 
              required 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
            />
          </div>
          
          <div className="info-box bg-surface mb-6 p-4 rounded flex gap-4 items-center" style={{ backgroundColor: '#EDF2F7', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <Info size={24} color="#3182CE" />
            <p className="text-sm text-secondary" style={{ margin: 0 }}>
              Only authenticated students can upload. Notes are public and downloadable by fellow college peers.
            </p>
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="btn btn-primary btn-lg w-full"
          >
            {isSubmitting ? 'Uploading...' : 'Share Notes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
