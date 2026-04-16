import { useVoiceStore } from '../../stores/voiceStore';
import { Phone, PhoneOff } from 'lucide-react';
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
        {activeCalls.map((call) => (
          <button
            key={call.call_id}
            onClick={() => selectCall(call.call_id)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-all ${
              selectedCallId === call.call_id ? 'glass-panel-active' : 'hover:bg-white/5'
            }`}
          >
            <div className="relative shrink-0 w-4 h-4 flex items-center justify-center">
              <div className={`w-2 h-2 rounded-full ${call.alert_raised ? 'bg-red-400' : 'bg-emerald-400'}`} />
              {call.alert_raised && (
                <div
                  className="absolute inset-0 w-4 h-4 rounded-full border border-red-400"
                  style={{ animation: 'signal-ring 1.8s ease-out infinite' }}
                />
              )}
            </div>
            <Phone size={12} className="text-gray-400 shrink-0" />
            <span className="text-gray-300 truncate flex-1 font-mono">{call.location_id}</span>
            <span className="text-gray-500 font-mono shrink-0">{fmt(elapsed[call.call_id] ?? 0)}</span>
            {call.alert_raised && (
              <span className="text-red-400 text-xs font-mono font-bold shrink-0">ALERT</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
