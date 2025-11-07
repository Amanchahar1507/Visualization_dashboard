import React, { useEffect, useState, useRef } from 'react';
import { fetchSummary } from '../api';
import { FaChartLine, FaBullseye, FaBolt, FaGlobe } from 'react-icons/fa';


function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const refTarget = useRef(target);

  useEffect(() => {
    refTarget.current = target;
    let rafId;
    const start = performance.now();
    const initial = value;

    function step(now) {
      const elapsed = now - start;
      const pct = Math.min(1, elapsed / duration);
      const cur = initial + (refTarget.current - initial) * pct;
      setValue(cur);
      if (pct < 1) rafId = requestAnimationFrame(step);
    }

    
    if (target === 0) setValue(0);
    rafId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(rafId);
    
  }, [target, duration]);

  return value;
}


function Sparkline({ data = [], color = '#0b5fff', width = 120, height = 36 }) {
  if (!Array.isArray(data) || data.length === 0) {
   
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <rect x="0" y="0" width={width} height={height} fill="#f5f7fb" rx="6" />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1 || 1);

  const points = data.map((d, i) => {
    const x = i * step;
  
    const y = height - ((d - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  });

  const pathD = `M${points.join(' L ')}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d={`${pathD} L ${width},${height} L 0,${height} Z`} fill="url(#g)" opacity="0.9" />
    </svg>
  );
}


export default function Overview({ applied = {} }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sparkSample, setSparkSample] = useState([1,2,1,3,2]); 
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const s = await fetchSummary(applied);
        if (!cancelled) {
          setSummary(s || {});
          
          if (s && Array.isArray(s.byTopic) && s.byTopic.length > 0) {
            setSparkSample(s.byTopic.slice(0, 8).map(x => Number(x.count || 0)));
          } else {
            setSparkSample([1,2,1,3,2,4,3]);
          }
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load summary');
        console.error('Overview load error', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [applied]);

  const count = useCountUp(Number(summary?.count || 0), 900);
  const avgIntensity = useCountUp(Number(summary?.avgIntensity || 0), 900);
  const avgLikelihood = useCountUp(Number(summary?.avgLikelihood || 0), 900);
  const avgRelevance = useCountUp(Number(summary?.avgRelevance || 0), 900);

  return (
    <div className="overview-grid panel">
      <div className="overview-left">
        <h2>Overview</h2>
        <p className="muted">Snapshot of the dataset. KPIs update based on filters.</p>
      </div>

      <div className="overview-cards">
        <div className="kpi overview-card">
          <div className="kpi-icon"><FaGlobe /></div>
          <div className="kpi-body">
            <div className="kpi-label">Records</div>
            <div className="kpi-value">{loading ? 'Loading…' : Math.round(count).toLocaleString()}</div>
            <div className="kpi-spark"><Sparkline data={sparkSample} /></div>
          </div>
        </div>

        <div className="kpi overview-card">
          <div className="kpi-icon"><FaBolt /></div>
          <div className="kpi-body">
            <div className="kpi-label">Avg Intensity</div>
            <div className="kpi-value">{loading ? '—' : Number(avgIntensity).toFixed(1)}</div>
            <div className="kpi-spark"><Sparkline data={sparkSample.map(v => v * 0.6)} color="#00b894" /></div>
          </div>
        </div>

        <div className="kpi overview-card">
          <div className="kpi-icon"><FaBullseye /></div>
          <div className="kpi-body">
            <div className="kpi-label">Avg Likelihood</div>
            <div className="kpi-value">{loading ? '—' : Number(avgLikelihood).toFixed(1)}</div>
            <div className="kpi-spark"><Sparkline data={sparkSample.map(v => Math.max(1, v - 1))} color="#fdcb6e" /></div>
          </div>
        </div>

        <div className="kpi overview-card">
          <div className="kpi-icon"><FaChartLine /></div>
          <div className="kpi-body">
            <div className="kpi-label">Avg Relevance</div>
            <div className="kpi-value">{loading ? '—' : Number(avgRelevance).toFixed(1)}</div>
            <div className="kpi-spark"><Sparkline data={sparkSample.map(v => (v * 0.3) + 1)} color="#a29bfe" /></div>
          </div>
        </div>
      </div>

      <div className="overview-actions">
        <button className="btn" onClick={() => {
          
          setSummary(null);
          setSparkSample([1,2,1,3,2]);
          setTimeout(() => {
            fetchSummary(applied).then(s => { setSummary(s || {}); })
              .catch(e=>console.error(e));
          }, 250);
        }}>
          Refresh
        </button>
        <div className="muted" style={{ marginLeft: 12 }}>
          {error ? <span style={{ color: 'crimson' }}>{error}</span> : `Updated ${summary ? '' : '—'}`}
        </div>
      </div>
    </div>
  );
}
