import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';
import { format } from 'date-fns';
import { demoDailyReport } from '../../demo/data';

export default function DailyReport() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setReport(demoDailyReport);
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reports/daily/${date}`);
      setReport(data);
    } catch {
      setReport(demoDailyReport);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
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

          {report.metrics && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Incidents', value: report.metrics.total_incidents },
                { label: 'Resolved', value: report.metrics.resolved_count },
                { label: 'Avg Response', value: `${Math.round((report.metrics.avg_response_time_seconds ?? 0) / 60)}m` },
              ].map((m) => (
                <div key={m.label} className="glass-panel p-3 text-center">
                  <div className="text-2xl font-data font-bold text-aegis-cyan">{m.value}</div>
                  <div className="text-slate-500 text-xs mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          )}

          {report.patterns_observed && report.patterns_observed.length > 0 && (
            <div className="glass-panel p-4">
              <h3 className="text-slate-900 font-semibold mb-2">Patterns Observed</h3>
              <ul className="space-y-1">
                {report.patterns_observed.map((p: string, i: number) => (
                  <li key={i} className="text-slate-700 text-sm flex gap-2">
                    <span className="text-blue-500">•</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.tomorrow_watchpoints && report.tomorrow_watchpoints.length > 0 && (
            <div className="glass-panel p-4">
              <h3 className="text-amber-700 font-semibold mb-2">Tomorrow Watchpoints</h3>
              <ul className="space-y-1">
                {report.tomorrow_watchpoints.map((w: string, i: number) => (
                  <li key={i} className="text-slate-700 text-sm flex gap-2">
                    <span className="text-yellow-500">⚑</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!loading && !report && (
        <p className="text-slate-500 text-sm text-center py-8">Select a date and load report</p>
      )}
    </div>
  );
}
