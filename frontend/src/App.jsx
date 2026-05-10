import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { T } from './theme.js';
import Nav from './components/Nav.jsx';
import EngineersView from './components/EngineersView.jsx';
import EngineerDetail from './components/EngineerDetail.jsx';
import EngineerForm from './components/EngineerForm.jsx';
import ProjectsView from './components/ProjectsView.jsx';
import ProjectDetail from './components/ProjectDetail.jsx';
import ProjectForm from './components/ProjectForm.jsx';
import TimelineView from './components/TimelineView.jsx';
import SkillsView from './components/SkillsView.jsx';
import AboutView from './components/AboutView.jsx';
import TestsView from './components/TestsView.jsx';

export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: T.bg }}>
        <Nav isMobile={isMobile} menuOpen={menuOpen} onToggle={() => setMenuOpen(o => !o)} onClose={() => setMenuOpen(false)} />
        <main style={{
          flex: 1,
          marginLeft: isMobile ? 0 : 240,
          padding: isMobile ? '72px 16px 24px' : '24px 28px',
          overflowY: 'auto',
          minHeight: '100vh',
          width: isMobile ? '100%' : 'auto',
        }}>
          <Routes>
            <Route path="/" element={<Navigate to="/allocation" replace />} />
            <Route path="/engineers" element={<EngineersView />} />
            <Route path="/engineers/new" element={<EngineerForm />} />
            <Route path="/engineers/:id" element={<EngineerDetail />} />
            <Route path="/engineers/:id/edit" element={<EngineerForm />} />
            <Route path="/projects" element={<ProjectsView />} />
            <Route path="/projects/new" element={<ProjectForm />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/projects/:id/edit" element={<ProjectForm />} />
            <Route path="/allocation" element={<TimelineView />} />
            <Route path="/skills" element={<SkillsView />} />
            <Route path="/about" element={<AboutView />} />
            <Route path="/tests" element={<TestsView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
