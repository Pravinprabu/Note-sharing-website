import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
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
      <Footer />
    </div>
  );
};

export default Layout;
