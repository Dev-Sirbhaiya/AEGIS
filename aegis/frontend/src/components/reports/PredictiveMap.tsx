import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';
import { demoPredictions } from '../../demo/data';

interface RiskEntry {
  location_id: string;
  hour: number;
  risk_score: number;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function riskColor(score: number): string {
  if (score >= 0.8) return 'bg-red-700';
  if (score >= 0.6) return 'bg-orange-600';
  if (score >= 0.4) return 'bg-yellow-600';
  if (score >= 0.2) return 'bg-green-700';
  return 'bg-gray-800';
}

export default function PredictiveMap() {
  const [data, setData] = useState<RiskEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/predictions')
      .then(({ data }) => {
        const predictions = data.predictions ?? [];
        // Fall back to demo data when backend returns empty (no history indexed yet)
        setData(predictions.length > 0 ? predictions : demoPredictions);
      })
      .catch(() => setData(demoPredictions))
      .finally(() => setLoading(false));
  }, []);

  const locations = [...new Set(data.map((d) => d.location_id))];

  const getScore = (location: string, hour: number) => {
    const entry = data.find((d) => d.location_id === location && d.hour === hour);
    return entry?.risk_score ?? 0;
  };

  if (loading) {
    return <div className="flex justify-center py-8"><LoadingSpinner /></div>;
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        No prediction data available. Index the knowledge base and run reports first.
      </div>
    );
  }

  return (
    <div className="glass-panel p-4 overflow-x-auto">
      <div className="min-w-max">
        <div className="flex gap-1 mb-1 ml-32">
          {HOURS.map((h) => (
            <div key={h} className="w-6 text-center text-slate-500 text-xs font-data">
              {h}
            </div>
          ))}
        </div>

        {locations.map((loc) => (
          <div key={loc} className="flex items-center gap-1 mb-1">
            <div className="w-32 text-slate-600 text-xs truncate pr-2 font-data">{loc}</div>
            {HOURS.map((h) => {
              const score = getScore(loc, h);
              return (
                <div
                  key={h}
                  className={`w-6 h-5 rounded-sm ${riskColor(score)}`}
                  title={`${loc} at ${h}:00 — Risk: ${Math.round(score * 100)}%`}
                />
              );
            })}
          </div>
        ))}

        <div className="flex items-center gap-2 mt-4">
          <span className="text-slate-500 text-xs">Risk:</span>
          {[
            { color: 'bg-gray-800', label: 'None' },
            { color: 'bg-green-700', label: 'Low' },
            { color: 'bg-yellow-600', label: 'Moderate' },
            { color: 'bg-orange-600', label: 'High' },
            { color: 'bg-red-700', label: 'Critical' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1">
              <div className={`w-4 h-4 rounded-sm ${item.color} border border-slate-300`} />
              <span className="text-slate-500 text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
