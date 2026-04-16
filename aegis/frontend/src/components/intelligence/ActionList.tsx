import { useEffect, useState } from 'react';
import { useIncidentStore } from '../../stores/incidentStore';
import { getSocket, onIncidentActionTaken } from '../../services/socket';
import { CheckCircle, Radio, Lock, AlertCircle, Zap } from 'lucide-react';
import type { Recommendation } from '../../types/incident';

const ACTION_COLORS: Record<string, { strip: string; icon: React.ReactNode; badge: string }> = {
  dispatch: { strip: '#2563eb', icon: <Radio size={13} />,        badge: 'text-blue-700 bg-blue-50 border-blue-200'     },
  call:     { strip: '#9333ea', icon: <Radio size={13} />,        badge: 'text-purple-700 bg-purple-50 border-purple-200' },
  alert:    { strip: '#d97706', icon: <AlertCircle size={13} />,  badge: 'text-amber-700 bg-amber-50 border-amber-200'  },
  lock:     { strip: '#dc2626', icon: <Lock size={13} />,         badge: 'text-red-700 bg-red-50 border-red-200'        },
  default:  { strip: '#2563eb', icon: <Zap size={13} />,          badge: 'text-blue-700 bg-blue-50 border-blue-200'     },
};

function inferActionType(action: string): string {
  const lower = action.toLowerCase();
  if (lower.includes('dispatch') || lower.includes('patrol') || lower.includes('deploy')) return 'dispatch';
  if (lower.includes('call') || lower.includes('notify') || lower.includes('contact')) return 'call';
  if (lower.includes('lock') || lower.includes('seal') || lower.includes('close')) return 'lock';
  if (lower.includes('alert') || lower.includes('alarm') || lower.includes('evacuate')) return 'alert';
  return 'default';
}

export default function ActionList() {
  const incident = useIncidentStore((s) => s.selectedIncident);
  const [actioned, setActioned] = useState<Set<number>>(new Set());

  useEffect(() => {
    setActioned(new Set());
  }, [incident?.id]);

  useEffect(() => {
    if (!incident) return;
    const unsubscribe = onIncidentActionTaken((data) => {
      if (data.incident_id !== incident.id) return;
      const idx = incident.recommendations.findIndex((r) => r.action === data.details);
      if (idx >= 0) setActioned((prev) => new Set(prev).add(idx));
    });
    return unsubscribe;
  }, [incident]);

  if (!incident || incident.recommendations.length === 0) {
    return (
      <div className="text-slate-500 text-sm text-center py-4">
        NO RECOMMENDATIONS
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
      <h3 className="section-eyebrow mb-0.5">
        Recommended Actions
      </h3>
      {incident.recommendations.map((rec, idx) => {
        const actionType = inferActionType(rec.action);
        const style = ACTION_COLORS[actionType] ?? ACTION_COLORS.default;
        const done = actioned.has(idx);
        return (
          <div
            key={idx}
            className={`glass-panel flex gap-0 overflow-hidden transition-all duration-300 ${done ? 'opacity-60' : ''}`}
          >
            <div className="w-1 shrink-0" style={{ backgroundColor: done ? '#16a34a' : style.strip }} />
            <div className="flex-1 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <span
                    className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold border ${done ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : style.badge}`}
                  >
                    {rec.priority}
                  </span>
                  <div className="min-w-0">
                    <p className="text-slate-800 text-sm font-medium">{rec.action}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{rec.who}</p>
                    {rec.reasoning && (
                      <p className="text-slate-500 text-xs mt-1">{rec.reasoning}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleAction(rec, idx)}
                  disabled={done}
                  className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full border transition-all duration-200 ${
                    done
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 cursor-default'
                      : 'bg-transparent hover:bg-blue-50 border-slate-200 text-slate-600 hover:border-aegis-cyan hover:text-aegis-cyan hover:shadow-[0_0_8px_rgba(37,99,235,0.2)]'
                  }`}
                >
                  {done ? <><CheckCircle size={12} /> DONE</> : <>{style.icon} ACT</>}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
