import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';
import { format } from 'date-fns';
import { demoMonthlyReport } from '../../demo/data';

export default function MonthlyReport() {
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reports/monthly/${month}`);
      setReport(data);
    } catch {
      setReport(demoMonthlyReport);
    } finally {
      setLoading(false);
    }
  };

  const bySeverity = report?.incident_analysis?.by_severity;
  const chartData = bySeverity
    ? Object.entries(bySeverity).map(([level, count]) => ({
        name: `L${level}`,
        count: count as number,
      }))
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="app-input text-sm"
        />
        <button
          onClick={fetchReport}
          className="button-primary px-4 py-2 text-sm"
        >
          Load Report
        </button>
      </div>

      {loading && <div className="flex justify-center py-8"><LoadingSpinner /></div>}

      {!loading && report && (
        <div className="space-y-4">
          <div className="glass-panel p-4">
            <h3 className="text-slate-900 font-semibold mb-2">Executive Summary</h3>
            <p className="text-slate-700 text-sm leading-6">{report.executive_summary}</p>
          </div>

          {chartData.length > 0 && (
            <div className="glass-panel p-4">
              <h3 className="text-slate-900 font-semibold mb-4">Incidents by Severity</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #dbe4f0', borderRadius: 12 }}
                    labelStyle={{ color: '#0f172a' }}
                    itemStyle={{ color: '#1d4ed8' }}
                  />
                  <Bar dataKey="count" fill="#4493f8" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {report.threat_landscape && (
            <div className="glass-panel p-4">
              <h3 className="text-slate-900 font-semibold mb-2">Threat Landscape</h3>
              <p className="text-slate-600 text-sm mb-3">{report.threat_landscape.threat_level_assessment}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="section-eyebrow mb-2">Primary Threats</p>
                  <ul className="space-y-0.5">
                    {(report.threat_landscape.primary_threats ?? []).map((t: string, i: number) => (
                      <li key={i} className="text-gray-300 text-xs">• {t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="section-eyebrow mb-2">Emerging Concerns</p>
                  <ul className="space-y-0.5">
                    {(report.threat_landscape.emerging_concerns ?? []).map((t: string, i: number) => (
                      <li key={i} className="text-yellow-400 text-xs">• {t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {report.strategic_recommendations && (
            <div className="glass-panel p-4">
              <h3 className="text-slate-900 font-semibold mb-2">Strategic Recommendations</h3>
              <div className="space-y-2">
                {report.strategic_recommendations.map((r: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    <span className={`text-xs font-bold shrink-0 ${r.priority === 'High' ? 'text-red-600' : r.priority === 'Medium' ? 'text-amber-600' : 'text-slate-500'}`}>
                      {r.priority}
                    </span>
                    <div>
                      <p className="text-slate-800 text-sm">{r.recommendation}</p>
                      <p className="text-slate-500 text-xs">{r.rationale}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && !report && (
        <p className="text-slate-500 text-sm text-center py-8">Select a month and load report</p>
      )}
    </div>
  );
}
