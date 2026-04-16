import { useEffect, useState } from 'react';
import { isConnected } from '../../services/socket';
import { useIncidentStore } from '../../stores/incidentStore';

const MODELS = [
  { label: 'AI Engine', key: 'ai' },
  { label: 'RAG',       key: 'rag' },
  { label: 'Voice',     key: 'voice' },
];

const TICKER_MESSAGES = [
  'All systems nominal',
  'Multimodal fusion active',
  'Knowledge base indexed',
  'RAG pipeline ready',
  'Voice agent standby',
  'WebSocket connected',
];

export default function StatusBar() {
  const [connected, setConnected] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [tickerIdx, setTickerIdx] = useState(0);
  const incidents = useIncidentStore((s) => s.incidents);
  const isDemo = incidents.length > 0 && incidents[0]?.id?.startsWith('INC_DEMO_');

  useEffect(() => {
    const interval = setInterval(() => {
      setConnected(isConnected());
      setUptime((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTickerIdx((i) => (i + 1) % TICKER_MESSAGES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div
      className="px-4 py-1.5 flex items-center justify-between text-xs shrink-0"
      style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0' }}
    >
      {/* Connection status */}
      <div className="flex items-center gap-2">
        <div className="relative w-2 h-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-500'}`} />
          {connected && (
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-50" />
          )}
        </div>
        <span className={`font-semibold ${connected ? 'text-emerald-600' : 'text-red-600'}`}>
          {connected ? 'CONNECTED' : 'OFFLINE'}
        </span>
        <span className="text-slate-300 mx-1">|</span>
        <span className="text-slate-600 animate-fade-in" key={tickerIdx}>
          {TICKER_MESSAGES[tickerIdx]}
        </span>
      </div>

      {/* Model health dots */}
      <div className="flex items-center gap-4">
        {MODELS.map((model) => (
          <div key={model.key} className="flex items-center gap-1.5">
            <div className="relative w-1.5 h-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-40" style={{animationDuration:'2.5s'}} />
            </div>
            <span className="text-slate-500">{model.label}</span>
          </div>
        ))}
      </div>

      {/* Demo mode badge */}
      {isDemo && (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          DEMO MODE
        </span>
      )}

      {/* Uptime */}
      <div className="text-slate-500">
        Uptime <span className="font-data text-slate-700">{formatUptime(uptime)}</span>
      </div>
    </div>
  );
}
