import React, { useState } from 'react';
import { UploadCloud, File, Info } from 'lucide-react';
import './Pages.css';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [dept, setDept] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      setMessage('You must be logged in to upload files.');
      return;
    }

    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    
    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Notes shared successfully!');
        setFile(null);
        setTitle('');
        setDept('');
        setSubject('');
      } else {
        setMessage(data.message || 'Upload failed.');
      }
    } catch (error) {
      setMessage('Error connecting to server.');
    }
  };

  return (
    <div className="container py-12 page-fade-in flex justify-center">
      <div className="upload-container glass-card w-full" style={{ maxWidth: '700px', padding: '3rem' }}>
        <h1 className="mb-2">Upload Lecture Notes</h1>
        <p className="text-secondary mb-8">Share your knowledge with others. Please upload high-quality, readable PDFs.</p>
        
        {message && <p style={{color: message.includes('successfully') ? 'green' : 'red', marginBottom: '10px'}}>{message}</p>}

        <form onSubmit={handleUpload}>
          <div className="upload-dropzone mb-8 text-center" style={{ border: '2px dashed var(--primary)', borderRadius: 'var(--radius-lg)', padding: '3rem 2rem', backgroundColor: 'var(--primary-light)', position: 'relative' }}>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={e => setFile(e.target.files[0])} 
              style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} 
            />
            {file ? (
                <>
                    <File size={48} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
                    <h3 className="mb-2">{file.name}</h3>
                </>
            ) : (
                <>
                    <UploadCloud size={48} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
                    <h3 className="mb-2">Click to browse your computer</h3>
                    <p className="text-secondary mb-4">You can click here to select a file</p>
                    <p className="text-secondary text-sm">Supported formats: PDF Only</p>
                </>
            )}
          </div>
          
          <div className="input-group">
            <label htmlFor="title">Note Title</label>
            <input type="text" id="title" className="input" placeholder="e.g. Complete Graph Theory Notes" required value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          
          <div className="grid-2 gap-4 mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div className="input-group">
              <label htmlFor="dept">Department</label>
              <select id="dept" className="input" required value={dept} onChange={e => setDept(e.target.value)}>
                 <option value="" disabled>Select department</option>
                 <option value="it">Information Technology</option>
                 <option value="csd">Computer Science and design</option>
                 <option value="ece">Electronics and Communication</option>
                 <option value="eee">Electronics and Electrical</option>
                 <option value="mech">Mechanical</option>
                 <option value="civil">Civil</option>
                 <option value="sh">Science and Humanities</option>
                 <option value="ece_act">ECE(ACT)</option>
                 <option value="ece_vlsi">ECE(VLSI)</option>
              </select>
            </div>
            
            <div className="input-group">
              <label htmlFor="subject">Subject Code</label>
              <input type="text" id="subject" className="input" placeholder="e.g. CS201" required value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
          </div>
          
          <div className="info-box bg-surface mb-6 p-4 rounded flex gap-4 items-center" style={{ backgroundColor: '#EDF2F7', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <Info size={24} color="#3182CE" />
            <p className="text-sm text-secondary" style={{ margin: 0 }}>Only signed up users can upload. By uploading, you agree to share these notes publicly.</p>
          </div>
          
          <button type="submit" className="btn btn-primary btn-lg w-full">Share Notes</button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
