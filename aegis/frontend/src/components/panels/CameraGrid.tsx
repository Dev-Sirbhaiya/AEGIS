import { useRef, useEffect } from 'react';
import { useIncidentStore } from '../../stores/incidentStore';
import { Expand } from 'lucide-react';

const GRID_CAMERAS = [
  { label: 'T2 Gate B4',       video: '/media/videos/terminal_corridor.mp4', locationId: 'T2_GATE_B4' },
  { label: 'T3 Arrival Hall',  video: '/media/videos/arrival_hall.mp4',      locationId: 'T3_ARRIVAL_HALL' },
  { label: 'T1 Check-in',      video: '/media/videos/rolling_corridor.mp4',  locationId: 'T1_CHECKIN_ROW_G' },
  { label: 'T4 Screening',     video: '/media/videos/security_screening.mp4', locationId: 'T4_SCREENING_A' },
];

interface Props {
  onExpand: () => void;
  onSelectCamera?: (locationId: string) => void;
}

export default function CameraGrid({ onExpand, onSelectCamera }: Props) {
  const incidents = useIncidentStore((s) => s.incidents);

  return (
    <div className="glass-panel overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
        <span className="text-xs font-mono text-slate-500 tracking-wider">CAMERA GRID</span>
        <button
          onClick={onExpand}
          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-aegis-cyan transition-colors"
        >
          <Expand size={13} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-0.5 p-0.5 bg-slate-100">
        {GRID_CAMERAS.map((cam, idx) => {
          const hasAlert = incidents.some(
            (i) => i.status === 'active' && i.severity_level >= 4 && i.location_id === cam.locationId
          );
          return (
            <GridTile
              key={idx}
              cam={cam}
              hasAlert={hasAlert}
              onSelect={() => {
                onSelectCamera?.(cam.locationId);
                onExpand();
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function GridTile({
  cam,
  hasAlert,
  onSelect,
}: {
  cam: { label: string; video: string; locationId: string };
  hasAlert: boolean;
  onSelect: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <button
      onClick={onSelect}
      className={`relative aspect-video overflow-hidden bg-black group ${hasAlert ? 'ring-1 ring-red-500' : ''}`}
    >
      <video
        ref={videoRef}
        src={cam.video}
        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        autoPlay loop muted playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-1 left-1.5 text-[9px] text-white font-mono opacity-80">{cam.label}</div>
      <div className="absolute top-1 left-1.5 flex items-center gap-0.5">
        <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[8px] text-red-400 font-mono">LIVE</span>
      </div>
      {hasAlert && (
        <div className="absolute top-1 right-1.5 text-[8px] text-red-400 font-mono font-bold bg-red-950/70 px-1 rounded">!</div>
      )}
    </button>
  );
}
