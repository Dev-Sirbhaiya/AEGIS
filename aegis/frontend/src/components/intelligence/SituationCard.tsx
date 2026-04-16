import { useEffect, useRef, useState } from 'react';
import { useIncidentStore } from '../../stores/incidentStore';
import SeverityBadge from '../shared/SeverityBadge';
import { timeAgo } from '../../utils/formatters';
import { Video, Volume2, Cpu, Database, AlertTriangle } from 'lucide-react';

function ArcGauge({ score, level }: { score: number; level: number }) {
  const colors = ['#10b981', '#84cc16', '#f59e0b', '#f97316', '#ef4444'];
  const color = colors[Math.min(level - 1, 4)];
  const r = 28;
  const cx = 36;
  const cy = 36;
  const circumference = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference * (1 - score));
    }, 100);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  return (
    <div className="relative w-[72px] h-[72px] shrink-0">
      <svg width={72} height={72} viewBox="0 0 72 72">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 4px ${color})` }}
        />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="12" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
          {Math.round(score * 100)}%
        </text>
      </svg>
    </div>
  );
}

function useTypewriter(text: string, speed = 14): string {
  const [displayed, setDisplayed] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!text) { setDisplayed(''); return; }
    setDisplayed('');
    let i = 0;
    const tick = () => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i < text.length) timerRef.current = setTimeout(tick, speed);
    };
    timerRef.current = setTimeout(tick, speed);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [text, speed]);

  return displayed;
}

const MODALITY_PILLS = [
  { key: 'has_video',  label: 'VIDEO',  icon: <Video  size={10} />, color: 'text-blue-400  bg-blue-950  border-blue-800'  },
  { key: 'has_audio',  label: 'AUDIO',  icon: <Volume2 size={10} />, color: 'text-purple-400 bg-purple-950 border-purple-800' },
  { key: 'has_sensor', label: 'SENSOR', icon: <Cpu    size={10} />, color: 'text-amber-400  bg-amber-950  border-amber-800'  },
  { key: 'has_log',    label: 'LOG',    icon: <Database size={10} />, color: 'text-emerald-400 bg-emerald-950 border-emerald-800' },
] as const;

const SEV_COLORS = ['', '#10b981', '#84cc16', '#f59e0b', '#f97316', '#ef4444'];

export default function SituationCard() {
  const incident = useIncidentStore((s) => s.selectedIncident);
  const explanation = useTypewriter(incident?.explanation ?? '');
  const isDone = !incident?.explanation || explanation.length >= incident.explanation.length;

  if (!incident) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center h-32 text-gray-600 text-sm">
        <AlertTriangle size={22} className="mb-2 opacity-30" />
        <span className="font-mono text-xs">SELECT AN INCIDENT</span>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4" style={{ borderTop: `3px solid ${SEV_COLORS[incident.severity_level]}` }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <SeverityBadge level={incident.severity_level} size="lg" />
          <p className="text-gray-500 text-xs mt-1 font-mono">{incident.location_id}</p>
        </div>
        <ArcGauge score={incident.severity_score} level={incident.severity_level} />
      </div>

      <div className="min-h-[3rem]">
        <p className="text-gray-300 text-sm leading-relaxed">
          {explanation}
          {!isDone && <span className="cursor-blink text-aegis-cyan ml-0.5">▌</span>}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 flex-wrap">
        {MODALITY_PILLS.map((pill) => (
          incident[pill.key] ? (
            <span key={pill.key} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-mono font-semibold ${pill.color}`}>
              {pill.icon}{pill.label}
            </span>
          ) : null
        ))}
        <span className="text-gray-600 text-xs font-mono ml-auto">{timeAgo(incident.created_at)}</span>
      </div>
    </div>
  );
}
