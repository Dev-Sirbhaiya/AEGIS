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
      <div className="bg-gray-900 rounded border border-gray-700 px-3 py-3 flex items-center gap-2 text-gray-600 text-sm">
        <PhoneOff size={14} />
        <span>No active calls</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded border border-gray-700">
      <div className="px-3 py-2 border-b border-gray-700 text-xs text-gray-400 font-medium">
        ACTIVE CALLS ({activeCalls.length})
      </div>
      <div className="flex flex-col gap-1 p-2">
        {activeCalls.map((call) => (
          <button
            key={call.call_id}
            onClick={() => selectCall(call.call_id)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors ${
              selectedCallId === call.call_id ? 'bg-blue-900/40 border border-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <div className={`w-2 h-2 rounded-full shrink-0 ${call.alert_raised ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`} />
            <Phone size={12} className="text-gray-400 shrink-0" />
            <span className="text-gray-300 truncate flex-1">{call.location_id}</span>
            <span className="text-gray-500 font-mono shrink-0">{fmt(elapsed[call.call_id] ?? 0)}</span>
            {call.alert_raised && (
              <span className="text-red-400 text-xs font-bold shrink-0">ALERT</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
