import React, { useState, useEffect, useRef } from 'react';
import { FaMoon, FaSun, FaSearch, FaBell, FaUserCircle } from 'react-icons/fa';

export default function Header({ applied = {}, setApplied }) {
  const [theme, setTheme] = useState('light');
  const [q, setQ] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (applied && applied.q && applied.q !== q) {
      setQ(applied.q);
    }
  }, [applied]);

  function applySearch(searchText) {
    const s = (searchText || '').trim();
    const next = { ...(applied || {}) };
    if (s === '') {
      delete next.q;
      delete next.topics;
    } else {
      next.q = s;
      if (s.includes(',')) {
        next.topics = s.split(',').map(x => x.trim()).filter(Boolean).join(',');
      } else {
        delete next.topics;
      }
    }
    delete next.page;
    setApplied(next);
  }

  function onType(v) {
    setQ(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applySearch(v);
    }, 700);
  }

  function applyChip(sectorValue) {
    const next = { ...(applied || {}) };
    if (!sectorValue || String(sectorValue).toLowerCase() === 'all') {
      delete next.sector;
    } else {
      next.sector = sectorValue;
    }
    delete next.page;
    setApplied(next);
  }

  return (
    <header className="site-header" style={{ alignItems: 'center' }}>
      <div className="brand">
        <div className="logo-mark">VD</div>
        <div className="brand-text">
          <div className="brand-title">Visualization</div>
          <div className="brand-sub">Insights Dashboard</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div className="search" style={{ maxWidth: '760px', width: '72%' }}>
          <span className="search-icon"><FaSearch /></span>
          <input
            placeholder="Search title, topic, country (or comma-separated topics)..."
            value={q}
            onChange={e => onType(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') applySearch(q); }}
            aria-label="Search records"
          />
          <button
            className="search-btn"
            onClick={() => applySearch(q)}
            title="Search"
          >Search</button>
        </div>
      </div>

      <div className="header-right" style={{ gap: 8 }}>
        <div className="quick-filters" style={{ display: 'flex', gap: 8 }}>
          <button className="chip" onClick={() => applyChip('All')}>All</button>
          <button className="chip" onClick={() => applyChip('Energy')}>Energy</button>
          <button className="chip" onClick={() => applyChip('Economy')}>Economy</button>
        </div>

        <div className="icons" style={{ display: 'flex', gap: 8 }}>
          <button className="icon-btn" title="Notifications"><FaBell /></button>
          <button
            className="icon-btn theme-toggle"
            onClick={() => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))}
            title="Toggle theme"
          >
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>
          <div className="profile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaUserCircle size={28} />
            <div className="profile-name">Aman</div>
          </div>
        </div>
      </div>
    </header>
  );
}
