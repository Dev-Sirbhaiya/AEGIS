import { useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';
import { format, subDays } from 'date-fns';

export default function DailyReport() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reports/daily/${date}`);
      setReport(data);
    } catch {
      setReport(null);
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
          className="bg-gray-800 text-gray-200 border border-gray-600 rounded px-3 py-1.5 text-sm"
        />
        <button
          onClick={fetchReport}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded"
        >
          Load Report
        </button>
      </div>

      {loading && <div className="flex justify-center py-8"><LoadingSpinner /></div>}

      {!loading && report && (
        <div className="space-y-4">
          <div className="bg-gray-800 rounded border border-gray-700 p-4">
            <h3 className="text-white font-semibold mb-2">Executive Summary</h3>
            <p className="text-gray-300 text-sm">{report.executive_summary}</p>
          </div>

          {report.metrics && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Incidents', value: report.metrics.total_incidents },
                { label: 'Resolved', value: report.metrics.resolved_count },
                { label: 'Avg Response', value: `${Math.round((report.metrics.avg_response_time_seconds ?? 0) / 60)}m` },
              ].map((m) => (
                <div key={m.label} className="bg-gray-800 rounded border border-gray-700 p-3 text-center">
                  <div className="text-2xl font-bold text-white">{m.value}</div>
                  <div className="text-gray-500 text-xs mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          )}

          {report.patterns_observed && report.patterns_observed.length > 0 && (
            <div className="bg-gray-800 rounded border border-gray-700 p-4">
              <h3 className="text-white font-semibold mb-2">Patterns Observed</h3>
              <ul className="space-y-1">
                {report.patterns_observed.map((p: string, i: number) => (
                  <li key={i} className="text-gray-300 text-sm flex gap-2">
                    <span className="text-blue-500">•</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.tomorrow_watchpoints && report.tomorrow_watchpoints.length > 0 && (
            <div className="bg-gray-800 rounded border border-gray-700 p-4">
              <h3 className="text-yellow-400 font-semibold mb-2">Tomorrow Watchpoints</h3>
              <ul className="space-y-1">
                {report.tomorrow_watchpoints.map((w: string, i: number) => (
                  <li key={i} className="text-gray-300 text-sm flex gap-2">
                    <span className="text-yellow-500">⚑</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!loading && !report && (
        <p className="text-gray-500 text-sm text-center py-8">Select a date and load report</p>
      )}
    </div>
  );
}
