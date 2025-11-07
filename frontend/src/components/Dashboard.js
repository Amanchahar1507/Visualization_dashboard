import React, { useEffect, useState } from 'react';
import FiltersPanel from './FiltersPanel';
import ChartsPanel from './ChartsPanel';
import Overview from './Overview';
import { fetchRecords, fetchSummary } from '../api';

export default function Dashboard({ applied, setApplied }) {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const pageSize = 100;

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      setLoading(true);
      setError(null);

      try {
        const sum = await fetchSummary(applied);
        if (!cancelled) setSummary(sum || null);

        const params = { ...applied, limit: pageSize, skip: page * pageSize };
        const rec = await fetchRecords(params);

        let arr = [];
        if (rec) {
          if (Array.isArray(rec)) arr = rec;
          else if (Array.isArray(rec.data)) arr = rec.data;
          else if (Array.isArray(rec.records)) arr = rec.records;
          else if (Array.isArray(rec.result)) arr = rec.result;
        }
        if (!cancelled) setRecords(arr);
      } catch (err) {
        if (!cancelled) {
          console.error('Dashboard load error', err);
          setError('Failed to load data from server');
          setRecords([]);
          setSummary(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();
    return () => { cancelled = true; };
  }, [applied, page]);

  const applyFilters = (newFilters) => {
    setPage(0);
    setApplied(newFilters || {});
  };

  const resetFilters = () => {
    setPage(0);
    setApplied({});
  };

  return (
    <div className="dashboard">
      <FiltersPanel applied={applied} setApplied={applyFilters} />

      <div className="main-panel">
        <Overview applied={applied} />

        <div className="panel top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0 }}>Analytics</h3>
            <div className="muted" style={{ marginTop: 6 }}>
              {loading ? 'Loading data…' : (summary ? `Showing ${summary.count} records (filtered)` : 'No summary yet')}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {error && <div style={{ color: 'crimson' }}>{error}</div>}
            <button onClick={() => { setPage(0); setApplied({ ...applied }); }}>Refresh</button>
            <button className="btn-ghost" onClick={resetFilters}>Reset Filters</button>
          </div>
        </div>

        <ChartsPanel summary={summary} records={records} />

        <div className="panel records-panel">
          <h3>Records Preview</h3>

          {loading ? (
            <div className="loader">Loading records…</div>
          ) : (
            <>
              <div style={{ maxHeight: 300, overflow: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Topic</th>
                      <th>Sector</th>
                      <th>Intensity</th>
                      <th>Likelihood</th>
                      <th>Country</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="muted">No records found for these filters.</td>
                      </tr>
                    ) : (
                      records.map((r, idx) => (
                        <tr key={r._id || idx}>
                          <td style={{ maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</td>
                          <td>{r.topic}</td>
                          <td>{r.sector}</td>
                          <td>{r.intensity ?? ''}</td>
                          <td>{r.likelihood ?? ''}</td>
                          <td>{r.country}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pager" style={{ marginTop: 10 }}>
                <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>Prev</button>
                <span style={{ alignSelf: 'center' }}>Page {page + 1}</span>
                <button onClick={() => setPage(page + 1)} disabled={summary && (page + 1) * pageSize >= (summary.count || 0)}>Next</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
