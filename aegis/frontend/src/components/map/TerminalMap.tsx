import { useEffect, useState } from 'react';
import { useIncidentStore } from '../../stores/incidentStore';

const LOCATION_COORDS: Record<string, { x: number; y: number }> = {
  T1_CHECKIN_ROW_G: { x: 47,  y: 135 },
  T1_GATE_A1:       { x: 28,  y: 100 },
  T1_GATE_A2:       { x: 58,  y: 92  },
  T2_GATE_B4:       { x: 196, y: 72  },
  T2_CHECKIN:       { x: 196, y: 112 },
  T3_ARRIVAL_HALL:  { x: 308, y: 100 },
  T3_GATE_C1:       { x: 262, y: 62  },
  T3_GATE_C3:       { x: 298, y: 56  },
  T4_CHECKIN:       { x: 408, y: 172 },
  JEWEL_L1:         { x: 128, y: 138 },
  JEWEL_L2:         { x: 128, y: 162 },
};

const SEVERITY_COLORS: Record<number, string> = {
  1: '#3d7055', 2: '#7faa5e', 3: '#d4891a', 4: '#c94a18', 5: '#cc3c3c',
};

export default function TerminalMap() {
  const { incidents, selectedIncident, selectIncident } = useIncidentStore();
  const activeIncidents = incidents.filter((i) => i.status !== 'resolved');
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => !p), 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="glass-panel overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <span className="text-xs font-mono text-gray-400 tracking-wider">TERMINAL MAP — CHANGI AIRPORT</span>
        <span className="text-[10px] font-mono text-gray-600">SG/WSSS</span>
      </div>
      <div className="p-2">
        <svg
          viewBox="0 0 470 230"
          className="w-full"
          style={{ background: 'rgba(12,10,7,0.7)', borderRadius: '4px' }}
        >
          <defs>
            <pattern id="mapgrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(232,160,32,0.05)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="470" height="230" fill="url(#mapgrid)" />

          {/* Connecting corridors */}
          <rect x="84"  y="112" width="75"  height="10" rx="2" fill="rgba(232,160,32,0.07)" stroke="rgba(232,160,32,0.14)" strokeWidth="0.5" />
          <rect x="224" y="88"  width="28"  height="8"  rx="2" fill="rgba(232,160,32,0.07)" stroke="rgba(232,160,32,0.14)" strokeWidth="0.5" />
          <rect x="368" y="144" width="8"   height="35" rx="2" fill="rgba(232,160,32,0.07)" stroke="rgba(232,160,32,0.14)" strokeWidth="0.5" />

          {/* Terminal 1 */}
          <rect x="10" y="72" width="74" height="130" rx="6" fill="rgba(232,160,32,0.05)" stroke="rgba(232,160,32,0.22)" strokeWidth="1" />
          <text x="47" y="210" textAnchor="middle" fill="rgba(232,160,32,0.45)" fontSize="9" fontFamily="IBM Plex Mono, monospace" fontWeight="600">T1</text>

          {/* Jewel */}
          <circle cx="128" cy="150" r="42" fill="rgba(232,160,32,0.03)" stroke="rgba(232,160,32,0.18)" strokeWidth="1" strokeDasharray="3 3" />
          <text x="128" y="200" textAnchor="middle" fill="rgba(232,160,32,0.35)" fontSize="8" fontFamily="IBM Plex Mono, monospace">JEWEL</text>

          {/* Terminal 2 */}
          <rect x="159" y="48" width="66" height="104" rx="4" fill="rgba(232,160,32,0.05)" stroke="rgba(232,160,32,0.22)" strokeWidth="1" />
          <text x="192" y="162" textAnchor="middle" fill="rgba(232,160,32,0.45)" fontSize="9" fontFamily="IBM Plex Mono, monospace" fontWeight="600">T2</text>

          {/* Terminal 3 */}
          <rect x="252" y="38" width="118" height="130" rx="4" fill="rgba(232,160,32,0.05)" stroke="rgba(232,160,32,0.22)" strokeWidth="1" />
          <text x="311" y="178" textAnchor="middle" fill="rgba(232,160,32,0.45)" fontSize="9" fontFamily="IBM Plex Mono, monospace" fontWeight="600">T3</text>

          {/* Terminal 4 */}
          <rect x="376" y="144" width="80" height="68" rx="4" fill="rgba(232,160,32,0.05)" stroke="rgba(232,160,32,0.22)" strokeWidth="1" />
          <text x="416" y="220" textAnchor="middle" fill="rgba(232,160,32,0.45)" fontSize="9" fontFamily="IBM Plex Mono, monospace" fontWeight="600">T4</text>

          {/* Incident markers */}
          {activeIncidents.map((incident) => {
            const pos = LOCATION_COORDS[incident.location_id];
            if (!pos) return null;
            const color = SEVERITY_COLORS[incident.severity_level] ?? '#cc3c3c';
            const isSelected = selectedIncident?.id === incident.id;

            return (
              <g key={incident.id} style={{ cursor: 'pointer' }} onClick={() => selectIncident(incident)}>
                {/* Pulsing ring */}
                <circle
                  cx={pos.x} cy={pos.y}
                  r={pulse ? 14 : 9}
                  fill="none" stroke={color} strokeWidth={1.5}
                  opacity={pulse ? 0.1 : 0.5}
                  style={{ transition: 'r 0.9s ease-out, opacity 0.9s ease-out' }}
                />
                {isSelected && (
                  <circle cx={pos.x} cy={pos.y} r={18} fill="none" stroke={color} strokeWidth={1} opacity={0.2} />
                )}
                <circle
                  cx={pos.x} cy={pos.y}
                  r={isSelected ? 6 : 5}
                  fill={color} opacity={0.9}
                  style={{ filter: `drop-shadow(0 0 ${isSelected ? 6 : 4}px ${color})` }}
                />
                <circle cx={pos.x} cy={pos.y} r={2} fill="white" opacity={0.8} />
              </g>
            );
          })}

          {activeIncidents.length === 0 && (
            <text x="235" y="115" textAnchor="middle" fill="rgba(232,160,32,0.2)" fontSize="10" fontFamily="IBM Plex Mono, monospace">
              ALL CLEAR
            </text>
          )}
        </svg>
      </div>

      <div className="px-3 pb-2 flex items-center gap-3 flex-wrap">
        {[1,2,3,4,5].map((level) => (
          <div key={level} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[level] }} />
            <span className="text-[9px] font-mono text-gray-500">L{level}</span>
          </div>
        ))}
        <span className="text-[9px] font-mono text-gray-600 ml-auto">{activeIncidents.length} ACTIVE</span>
      </div>
    </div>
  );
}
