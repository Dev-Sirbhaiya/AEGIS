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
          className="bg-gray-800 text-gray-200 border border-gray-600 rounded px-3 py-1.5 text-sm"
        />
        <button
          onClick={fetchReport}
          className="px-4 py-1.5 bg-aegis-cyan/15 hover:bg-aegis-cyan/25 border border-aegis-cyan/40 text-aegis-cyan text-xs font-mono font-bold rounded transition-all"
        >
          Load Report
        </button>
      </div>

      {loading && <div className="flex justify-center py-8"><LoadingSpinner /></div>}

      {!loading && report && (
        <div className="space-y-4">
          <div className="glass-panel p-4">
            <h3 className="text-white font-semibold mb-2">Executive Summary</h3>
            <p className="text-gray-300 text-sm">{report.executive_summary}</p>
          </div>

          {chartData.length > 0 && (
            <div className="glass-panel p-4">
              <h3 className="text-white font-semibold mb-4">Incidents by Severity</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 6 }}
                    labelStyle={{ color: '#F9FAFB' }}
                    itemStyle={{ color: '#60A5FA' }}
                  />
                  <Bar dataKey="count" fill="#00d4ff" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {report.threat_landscape && (
            <div className="glass-panel p-4">
              <h3 className="text-white font-semibold mb-2">Threat Landscape</h3>
              <p className="text-gray-400 text-xs mb-2">{report.threat_landscape.threat_level_assessment}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-500 text-xs font-semibold mb-1">Primary Threats</p>
                  <ul className="space-y-0.5">
                    {(report.threat_landscape.primary_threats ?? []).map((t: string, i: number) => (
                      <li key={i} className="text-gray-300 text-xs">• {t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-semibold mb-1">Emerging Concerns</p>
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
              <h3 className="text-white font-semibold mb-2">Strategic Recommendations</h3>
              <div className="space-y-2">
                {report.strategic_recommendations.map((r: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    <span className={`text-xs font-bold shrink-0 ${r.priority === 'High' ? 'text-red-400' : r.priority === 'Medium' ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {r.priority}
                    </span>
                    <div>
                      <p className="text-gray-300 text-sm">{r.recommendation}</p>
                      <p className="text-gray-500 text-xs">{r.rationale}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && !report && (
        <p className="text-gray-500 text-sm text-center py-8">Select a month and load report</p>
      )}
    </div>
  );
}
