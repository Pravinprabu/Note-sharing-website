import React from 'react';
import { UploadCloud, File, Info } from 'lucide-react';
import './Pages.css';

const Upload = () => {
  return (
    <div className="container py-12 page-fade-in flex justify-center">
      <div className="upload-container glass-card w-full" style={{ maxWidth: '700px', padding: '3rem' }}>
        <h1 className="mb-2">Upload Lecture Notes</h1>
        <p className="text-secondary mb-8">Share your knowledge with others. Please upload high-quality, readable PDFs.</p>
        
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="upload-dropzone mb-8 text-center" style={{ border: '2px dashed var(--primary)', borderRadius: 'var(--radius-lg)', padding: '3rem 2rem', backgroundColor: 'var(--primary-light)', cursor: 'pointer' }}>
            <UploadCloud size={48} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 className="mb-2">Drag & drop files here</h3>
            <p className="text-secondary mb-4">or click to browse your computer</p>
            <p className="text-secondary text-sm">Supported formats: PDF, ZIP (max 10MB)</p>
          </div>
          
          <div className="input-group">
            <label htmlFor="title">Note Title</label>
            <input type="text" id="title" className="input" placeholder="e.g. Complete Graph Theory Notes" required />
          </div>
          
          <div className="grid-2 gap-4 mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div className="input-group">
              <label htmlFor="dept">Department</label>
              <select id="dept" className="input" required>
                 <option value="" disabled selected>Select department</option>
                 <option value="cs">Computer Science</option>
                 <option value="mech">Mechanical Engineering</option>
                 <option value="math">Mathematics</option>
              </select>
            </div>
            
            <div className="input-group">
              <label htmlFor="subject">Subject Code</label>
              <input type="text" id="subject" className="input" placeholder="e.g. CS201" required />
            </div>
          </div>
          
          <div className="input-group mb-6">
            <label htmlFor="desc">Short Description (Optional)</label>
            <textarea id="desc" className="input" rows="3" placeholder="Briefly describe what these notes cover."></textarea>
          </div>
          
          <div className="info-box bg-surface mb-6 p-4 rounded flex gap-4 items-center" style={{ backgroundColor: '#EDF2F7', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <Info size={24} color="#3182CE" />
            <p className="text-sm text-secondary" style={{ margin: 0 }}>By uploading, you agree to share these notes publicly with the university community.</p>
          </div>
          
          <button type="submit" className="btn btn-primary btn-lg w-full">Share Notes</button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
