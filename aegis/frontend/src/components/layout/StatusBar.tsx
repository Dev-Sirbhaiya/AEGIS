import { useEffect, useState } from 'react';
import { isConnected } from '../../services/socket';

interface ModelStatus {
  label: string;
  key: string;
}

const MODELS: ModelStatus[] = [
  { label: 'Video', key: 'video' },
  { label: 'Audio', key: 'audio' },
  { label: 'LLM', key: 'llm' },
];

export default function StatusBar() {
  const [connected, setConnected] = useState(false);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setConnected(isConnected());
      setUptime((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-950 border-t border-gray-800 px-4 py-1.5 flex items-center justify-between text-xs shrink-0">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-500'}`} />
        <span className="text-gray-400">{connected ? 'Connected' : 'Disconnected'}</span>
      </div>

      <div className="flex items-center gap-4">
        {MODELS.map((model) => (
          <div key={model.key} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-gray-500">{model.label}</span>
          </div>
        ))}
      </div>

      <div className="text-gray-500">
        Uptime: <span className="text-gray-400 font-mono">{formatUptime(uptime)}</span>
      </div>
    </div>
  );
}
