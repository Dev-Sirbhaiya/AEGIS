import { useIncidentStore } from '../../stores/incidentStore';

const LEVELS = [
  { label: 'SECURE',   min: 0, color: '#10b981', glow: 'rgba(16,185,129,0.5)'  },
  { label: 'ELEVATED', min: 2, color: '#84cc16', glow: 'rgba(132,204,22,0.45)' },
  { label: 'HIGH',     min: 3, color: '#f59e0b', glow: 'rgba(245,158,11,0.5)'  },
  { label: 'CRITICAL', min: 4, color: '#ef4444', glow: 'rgba(239,68,68,0.55)'  },
  { label: 'LOCKDOWN', min: 5, color: '#dc2626', glow: 'rgba(220,38,38,0.7)'   },
];

export default function ThreatLevelGauge() {
  const incidents = useIncidentStore((s) => s.incidents);
  const maxSeverity = incidents
    .filter((i) => i.status === 'active')
    .reduce((max, i) => Math.max(max, i.severity_level), 0);

  let activeIdx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (maxSeverity >= LEVELS[i].min) { activeIdx = i; break; }
  }

  return (
    <div className="flex items-center gap-1">
      {LEVELS.map((lvl, idx) => {
        const isActive = idx === activeIdx;
        const isPast = idx < activeIdx;
        return (
          <div
            key={lvl.label}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all duration-500"
            style={{
              color: isActive ? lvl.color : isPast ? lvl.color : 'rgba(255,255,255,0.2)',
              background: isActive ? `${lvl.color}18` : 'transparent',
              border: `1px solid ${isActive ? lvl.color : isPast ? `${lvl.color}40` : 'rgba(255,255,255,0.08)'}`,
              boxShadow: isActive ? `0 0 8px ${lvl.glow}` : 'none',
              animation: isActive ? 'threat-flash 0.4s ease-out' : 'none',
            }}
          >
            {lvl.label}
          </div>
        );
      })}
    </div>
  );
}
