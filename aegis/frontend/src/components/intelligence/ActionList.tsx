import { useState } from 'react';
import { useIncidentStore } from '../../stores/incidentStore';
import { getSocket } from '../../services/socket';
import { CheckCircle, AlertCircle, Radio, Lock } from 'lucide-react';
import type { Recommendation } from '../../types/incident';

const ACTION_ICONS: Record<string, React.ReactNode> = {
  dispatch: <Radio size={14} />,
  call: <Radio size={14} />,
  alert: <AlertCircle size={14} />,
  lock: <Lock size={14} />,
};

export default function ActionList() {
  const incident = useIncidentStore((s) => s.selectedIncident);
  const [actioned, setActioned] = useState<Set<number>>(new Set());

  if (!incident || incident.recommendations.length === 0) {
    return (
      <div className="text-gray-600 text-sm text-center py-4">
        No recommendations yet
      </div>
    );
  }

  const handleAction = (rec: Recommendation, idx: number) => {
    setActioned((prev) => new Set(prev).add(idx));
    getSocket().emit('action:incident', {
      incident_id: incident.id,
      action_type: inferActionType(rec.action),
      details: rec.action,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
        Recommended Actions
      </h3>
      {incident.recommendations.map((rec, idx) => (
        <div
          key={idx}
          className={`rounded border p-3 transition-colors ${
            actioned.has(idx) ? 'border-green-700 bg-green-900/20' : 'border-gray-700 bg-gray-800/60'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <span className="text-gray-500 text-xs font-bold shrink-0 mt-0.5">
                #{rec.priority}
              </span>
              <div className="min-w-0">
                <p className="text-gray-200 text-sm font-medium">{rec.action}</p>
                <p className="text-gray-500 text-xs mt-0.5">{rec.who}</p>
                {rec.reasoning && (
                  <p className="text-gray-600 text-xs mt-1 italic">{rec.reasoning}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleAction(rec, idx)}
              disabled={actioned.has(idx)}
              className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded transition-colors ${
                actioned.has(idx)
                  ? 'bg-green-700 text-green-100 cursor-default'
                  : 'bg-blue-700 hover:bg-blue-600 text-white'
              }`}
            >
              {actioned.has(idx) ? (
                <><CheckCircle size={12} /> Done</>
              ) : (
                <>{ACTION_ICONS[inferActionType(rec.action)] ?? <CheckCircle size={12} />} Act</>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function inferActionType(action: string): string {
  const lower = action.toLowerCase();
  if (lower.includes('dispatch') || lower.includes('patrol') || lower.includes('deploy')) return 'dispatch';
  if (lower.includes('call') || lower.includes('notify') || lower.includes('contact')) return 'call';
  if (lower.includes('lock') || lower.includes('seal') || lower.includes('close')) return 'lock';
  return 'alert';
}
