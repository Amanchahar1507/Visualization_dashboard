import React, { useEffect, useState } from 'react';
import { fetchFilters } from '../api';

export default function FiltersPanel({ applied, setApplied }) {
  const [options, setOptions] = useState({});
  const [local, setLocal] = useState(applied || {});

  useEffect(() => {
    fetchFilters().then(setOptions).catch(console.error);
  }, []);

  useEffect(() => setLocal(applied), [applied]);

  const updateField = (k, v) => {
    const next = { ...local, [k]: v };
    setLocal(next);
  };

  const applyFilters = () => {
    
    const cleaned = {};
    Object.entries(local).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined) return;
      cleaned[k] = v;
    });
    setApplied(cleaned);
  };

  const reset = () => {
    setLocal({});
    setApplied({});
  };

  return (
    <div className="panel filters">
      <h3>Filters</h3>

      <div className="filter-row">
        <label>End Year (≤)</label>
        <input
          type="number"
          value={local.endYear || ''}
          onChange={e => updateField('endYear', e.target.value)}
          placeholder="e.g. 2025"
        />
      </div>

      <div className="filter-row">
        <label>Topics (comma)</label>
        <input
          type="text"
          value={local.topics || ''}
          onChange={e => updateField('topics', e.target.value)}
          placeholder="oil, gas, market"
        />
      </div>

      <div className="filter-row">
        <label>Sector</label>
        <select value={local.sector || ''} onChange={e => updateField('sector', e.target.value)}>
          <option value="">All</option>
          {(options.sector || []).map(s => <option key={s} value={s}>{s || '(empty)'}</option>)}
        </select>
      </div>

      <div className="filter-row">
        <label>Region</label>
        <select value={local.region || ''} onChange={e => updateField('region', e.target.value)}>
          <option value="">All</option>
          {(options.region || []).map(s => <option key={s} value={s}>{s || '(empty)'}</option>)}
        </select>
      </div>

      <div className="filter-row">
        <label>Country</label>
        <select value={local.country || ''} onChange={e => updateField('country', e.target.value)}>
          <option value="">All</option>
          {(options.country || []).map(s => <option key={s} value={s}>{s || '(empty)'}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={applyFilters}>Apply</button>
        <button onClick={reset} className="btn-ghost">Reset</button>
      </div>
    </div>
  );
}
