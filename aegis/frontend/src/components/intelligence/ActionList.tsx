import { useEffect, useState } from 'react';
import { useIncidentStore } from '../../stores/incidentStore';
import { getSocket, onIncidentActionTaken } from '../../services/socket';
import { CheckCircle, Radio, Lock, AlertCircle, Zap } from 'lucide-react';
import type { Recommendation } from '../../types/incident';

const ACTION_COLORS: Record<string, { strip: string; icon: React.ReactNode; badge: string }> = {
  dispatch: { strip: '#3b82f6', icon: <Radio size={13} />,        badge: 'text-blue-400 bg-blue-950 border-blue-800'   },
  call:     { strip: '#a855f7', icon: <Radio size={13} />,        badge: 'text-purple-400 bg-purple-950 border-purple-800' },
  alert:    { strip: '#f59e0b', icon: <AlertCircle size={13} />,  badge: 'text-amber-400 bg-amber-950 border-amber-800'  },
  lock:     { strip: '#ef4444', icon: <Lock size={13} />,         badge: 'text-red-400 bg-red-950 border-red-800'      },
  default:  { strip: '#4493f8', icon: <Zap size={13} />,          badge: 'text-blue-400 bg-blue-950 border-blue-800'  },
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

  // Reset DONE marks whenever the operator switches to a different incident —
  // otherwise index-based action tracking bleeds across incidents.
  useEffect(() => {
    setActioned(new Set());
  }, [incident?.id]);

  // When any seat broadcasts an action on *this* incident, mirror the DONE
  // state locally so multi-operator SOC deployments stay in sync.
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
      <div className="text-gray-600 text-sm text-center py-4 font-mono">
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
      <h3 className="text-gray-400 text-xs font-mono font-semibold uppercase tracking-widest mb-0.5">
        Recommended Actions
      </h3>
      {incident.recommendations.map((rec, idx) => {
        const actionType = inferActionType(rec.action);
        const style = ACTION_COLORS[actionType] ?? ACTION_COLORS.default;
        const done = actioned.has(idx);
        return (
          <div
            key={idx}
            className={`glass-panel flex gap-0 overflow-hidden transition-all duration-300 ${done ? 'opacity-70' : ''}`}
          >
            <div className="w-1 shrink-0" style={{ backgroundColor: done ? '#10b981' : style.strip }} />
            <div className="flex-1 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <span
                    className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold border ${done ? 'text-emerald-400 bg-emerald-950 border-emerald-700' : style.badge}`}
                  >
                    {rec.priority}
                  </span>
                  <div className="min-w-0">
                    <p className="text-gray-200 text-sm font-medium">{rec.action}</p>
                    <p className="text-gray-500 text-xs mt-0.5 font-mono">{rec.who}</p>
                    {rec.reasoning && (
                      <p className="text-gray-600 text-xs mt-1 italic">{rec.reasoning}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleAction(rec, idx)}
                  disabled={done}
                  className={`shrink-0 flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1.5 rounded border transition-all duration-200 ${
                    done
                      ? 'bg-emerald-950 border-emerald-700 text-emerald-400 cursor-default'
                      : 'bg-transparent hover:bg-white/5 border-white/20 text-white hover:border-aegis-cyan hover:text-aegis-cyan hover:shadow-[0_0_8px_rgba(68,147,248,0.3)]'
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
