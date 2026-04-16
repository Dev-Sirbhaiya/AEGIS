import { useVoiceStore } from '../../stores/voiceStore';
import { Phone, PhoneOff, Radio } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function VoiceStatus() {
  const { activeCalls, selectedCallId, selectCall } = useVoiceStore();
  const [elapsed, setElapsed] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const updated: Record<string, number> = {};
      for (const call of activeCalls) {
        updated[call.call_id] = Math.floor((now - new Date(call.started_at).getTime()) / 1000);
      }
      setElapsed(updated);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCalls]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  if (activeCalls.length === 0) {
    return (
      <div className="glass-panel px-3 py-3 flex items-center gap-2 text-gray-600 text-sm font-mono">
        <PhoneOff size={14} />
        <span>NO ACTIVE CALLS</span>
      </div>
    );
  }

  return (
    <div className="glass-panel">
      <div className="px-3 py-2 border-b border-white/5 text-xs text-gray-400 font-mono tracking-wider">
        ACTIVE CALLS ({activeCalls.length})
      </div>
      <div className="flex flex-col gap-1 p-2">
        {activeCalls.map((call) => {
          const isPatrol = call.call_type === 'patrol';
          const urgencyPct = Math.round((call.urgency_score ?? 0) * 100);
          const urgencyColor = urgencyPct >= 80 ? 'bg-red-500' : urgencyPct >= 50 ? 'bg-amber-500' : 'bg-emerald-500';

          return (
            <button
              key={call.call_id}
              onClick={() => selectCall(call.call_id)}
              className={`flex flex-col gap-1.5 px-2 py-2 rounded text-left text-xs transition-all ${
                selectedCallId === call.call_id ? 'glass-panel-active' : 'hover:bg-white/5'
              }`}
            >
              {/* Top row */}
              <div className="flex items-center gap-2">
                {/* Status dot with optional alert ring */}
                <div className="relative shrink-0 w-4 h-4 flex items-center justify-center">
                  <div className={`w-2 h-2 rounded-full ${call.alert_raised ? 'bg-red-400' : 'bg-emerald-400'}`} />
                  {call.alert_raised && (
                    <div
                      className="absolute inset-0 w-4 h-4 rounded-full border border-red-400"
                      style={{ animation: 'signal-ring 1.8s ease-out infinite' }}
                    />
                  )}
                </div>

                {/* Call type badge */}
                <span className={`text-[9px] font-mono font-bold px-1 py-0.5 rounded tracking-widest ${
                  isPatrol
                    ? 'bg-aegis-cyan/15 text-aegis-cyan border border-aegis-cyan/30'
                    : 'bg-red-500/15 text-red-400 border border-red-500/30'
                }`}>
                  {isPatrol ? <><Radio size={8} className="inline mr-0.5" />PATROL</> : <><Phone size={8} className="inline mr-0.5" />DISTRESS</>}
                </span>

                {/* Location */}
                <span className="text-gray-300 truncate flex-1 font-mono">{call.location_id}</span>

                {/* Timer */}
                <span className="text-gray-500 font-mono shrink-0">{fmt(elapsed[call.call_id] ?? 0)}</span>
              </div>

              {/* Urgency bar */}
              {urgencyPct > 0 && (
                <div className="flex items-center gap-2 pl-6">
                  <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${urgencyColor}`}
                      style={{ width: `${urgencyPct}%` }}
                    />
                  </div>
                  <span className={`text-[9px] font-mono font-bold shrink-0 ${
                    urgencyPct >= 80 ? 'text-red-400' : urgencyPct >= 50 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {urgencyPct}%
                  </span>
                  {call.alert_raised && (
                    <span className="text-red-400 text-[9px] font-mono font-bold shrink-0">ALERT</span>
                  )}
                </div>
              )}

              {/* Situation summary — shown once intelligence arrives */}
              {call.situation?.explanation && (
                <p className="pl-6 text-[9px] text-gray-400 font-mono leading-relaxed line-clamp-2">
                  {call.situation.explanation}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
