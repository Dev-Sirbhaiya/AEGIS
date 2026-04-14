import type { ScoreBreakdown } from '../../types/simulation';

interface Props {
  total: number;
  breakdown?: ScoreBreakdown;
  responseTime?: number;
}

const SCORE_ITEMS = [
  { key: 'response_time_score', label: 'Response Time', max: 10 },
  { key: 'primary_action_score', label: 'Primary Action', max: 30 },
  { key: 'secondary_action_score', label: 'Secondary Action', max: 20 },
  { key: 'escalation_score', label: 'Escalation', max: 20 },
  { key: 'no_overreaction_score', label: 'No Over-reaction', max: 10 },
  { key: 'communication_score', label: 'Communication', max: 10 },
];

function scoreColor(pct: number) {
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

export default function ScoreCard({ total, breakdown, responseTime }: Props) {
  const grade = total >= 90 ? 'A' : total >= 75 ? 'B' : total >= 55 ? 'C' : 'D';
  const gradeColor = grade === 'A' ? 'text-green-400' : grade === 'B' ? 'text-blue-400' : grade === 'C' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-lg font-bold">Score Report</h2>
          {responseTime && (
            <p className="text-gray-400 text-sm">First response: {responseTime}s</p>
          )}
        </div>
        <div className="text-center">
          <div className={`text-4xl font-bold ${gradeColor}`}>{grade}</div>
          <div className="text-gray-400 text-sm">{total}/100</div>
        </div>
      </div>

      {breakdown && (
        <div className="space-y-3">
          {SCORE_ITEMS.map(({ key, label, max }) => {
            const value = (breakdown as any)[key] ?? 0;
            const pct = (value / max) * 100;
            return (
              <div key={key}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">{label}</span>
                  <span className="text-gray-300">{value}/{max}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${scoreColor(pct)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
