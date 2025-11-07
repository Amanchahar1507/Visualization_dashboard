
import React from 'react';
import { Bar, Doughnut, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, ArcElement, Tooltip, Legend);

const palette = [
  '#0b5fff','#00b894','#0984e3','#fdcb6e','#e17055','#a29bfe','#00cec9','#fab1a0','#55efc4','#ffeaa7'
];

export default function ChartsPanel({ summary, records }) {
  const safeSummary = summary || {};
  const topTopics = Array.isArray(safeSummary.topTopics) ? safeSummary.topTopics : (Array.isArray(safeSummary.byTopic) ? safeSummary.byTopic : []);
  const byRegion = Array.isArray(safeSummary.byRegion) ? safeSummary.byRegion : [];
  const scatterRecords = Array.isArray(records) ? records.filter(r => r && (r.intensity !== undefined || r.likelihood !== undefined)) : [];

  
  const topicsLabels = topTopics.map(t => t._id || 'Unknown');
  const topicsCounts = topTopics.map(t => Number(t.count || 0));

  const regionLabels = byRegion.map(r => r._id || 'Unknown');
  const regionCounts = byRegion.map(r => Number(r.count || 0));

  const donutData = {
    labels: topicsLabels,
    datasets: [{
      data: topicsCounts,
      backgroundColor: topicsLabels.map((_, i) => palette[i % palette.length]),
      hoverOffset: 6
    }]
  };

  const barData = {
    labels: regionLabels,
    datasets: [{
      label: 'Records by Region',
      data: regionCounts,
      backgroundColor: regionLabels.map((_, i) => palette[i % palette.length])
    }]
  };

  const scatterData = {
    datasets: [{
      label: 'Intensity vs Likelihood',
      data: scatterRecords.map(r => ({
        x: Number(r.intensity) || 0,
        y: Number(r.likelihood) || 0,
        r: Math.max(3, Math.min(20, Number(r.relevance) || 1)),
        title: r.title || ''
      })),
      backgroundColor: '#0b5fff88'
    }]
  };

  const baseOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { mode: 'nearest' } },
    maintainAspectRatio: false
  };

  return (
    <div className="panel charts enhanced-charts">
      
      <div className="chart-section section-top">
        <div className="section-header">
          <div>
            <h4>Top Topics</h4>
            <div className="section-sub muted">Most frequent topics in the dataset</div>
          </div>
          
        </div>

        <div className="chart-row split-2">
          <div className="chart-card small-card">
            <Doughnut data={donutData} options={{ ...baseOptions, plugins: { legend: { position: 'right' } } }} />
          </div>

          <div className="chart-card small-card">
            <Bar data={barData} options={{ ...baseOptions, plugins: { legend: { display: false }, tooltip: { mode: 'index' } }, scales: { y: { beginAtZero: true } } }} />
          </div>
        </div>
      </div>

      
      <div className="section-sep" />

      <div className="chart-section section-middle">
        <div className="section-header">
          <div>
            <h4>Intensity vs Likelihood</h4>
            <div className="section-sub muted">Bubble size ≈ relevance. Use filters to focus the view.</div>
          </div>
        </div>

        <div className="chart-full chart-card tall-card">
          <Scatter
            data={scatterData}
            options={{
              ...baseOptions,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: ctx => `Intensity: ${ctx.raw.x}, Likelihood: ${ctx.raw.y}, Relevance: ${ctx.raw.r}`
                  }
                }
              },
              scales: {
                x: { title: { display: true, text: 'Intensity' } },
                y: { title: { display: true, text: 'Likelihood' } }
              }
            }}
          />
        </div>
      </div>

      <div className="section-sep" />

    </div>
  );
}
