import React from 'react';
import Navbar from './Navbar';
import FloatingBackground from './FloatingBackground';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="layout-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <FloatingBackground />
      <Navbar />
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>
      <footer style={{ padding: '2rem 1rem', textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(8px)', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)', position: 'relative', zIndex: 1 }}>
        <p>&copy; {new Date().getFullYear()} Note Share. Created for students.</p>
      </footer>
    </div>
  );
};

export default Layout;
