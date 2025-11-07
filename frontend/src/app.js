import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import './styles.css';

export default function App() {
  const [applied, setApplied] = useState({});

  return (
    <div className="app-root">
      <Header applied={applied} setApplied={setApplied} />
      <main className="app-main">
        <Dashboard applied={applied} setApplied={setApplied} />
      </main>

      <footer className="app-footer">
        <div className="footer-inner">
          <div>© {new Date().getFullYear()} Visualization Dashboard</div>
          <div className="footer-right">Built with MERN • Data source: provided JSON</div>
        </div>
      </footer>
    </div>
  );
}
