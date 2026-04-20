import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="layout-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <footer style={{ padding: '2rem 1rem', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
        <p>&copy; {new Date().getFullYear()} Note Share. Created for students.</p>
      </footer>
    </div>
  );
};

export default Layout;
