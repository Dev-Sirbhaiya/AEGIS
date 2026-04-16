import { useEffect, useMemo, useRef, useState } from 'react';
import { useCameraStore } from '../../stores/cameraStore';
import { useIncidentStore } from '../../stores/incidentStore';
import { Camera, AlertTriangle, Grid2x2 } from 'lucide-react';
import { getIncidentMedia } from '../../utils/incidentMedia';

interface Props {
  onSwitchGrid?: () => void;
}

export default function CameraFeed({ onSwitchGrid }: Props) {
  const { cameras, selectedCamera, media, fetchCameras, selectCamera } = useCameraStore();
  const selectedIncident = useIncidentStore((s) => s.selectedIncident);
  const incidents = useIncidentStore((s) => s.incidents);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(new Date());

  const incidentMedia = useMemo(() => {
    if (!selectedIncident) return null;
    // Match strictly on location_id (e.g. "T2_GATE_B4"). Don't compare on
    // `zone` ("public"/"airside"/"restricted") — that's a category and would
    // light up every public camera for any public-zone incident.
    const sameZone =
      !selectedCamera ||
      selectedCamera.location_id === selectedIncident.location_id;
    if (!sameZone) return null;
    return getIncidentMedia(selectedIncident);
  }, [selectedIncident, selectedCamera]);

  const activeVideoUrl = incidentMedia
    ? `/media/videos/${incidentMedia.video}`
    : media?.video_url;

  useEffect(() => { fetchCameras(); }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!videoRef.current || !activeVideoUrl) return;
    setError(false);
    videoRef.current.src = activeVideoUrl;
    videoRef.current.load();
    // play() rejects with AbortError when a subsequent load() interrupts it
    // (happens on rapid camera switches). That's not a real stream failure,
    // so don't flip the error overlay for it.
    videoRef.current.play().catch((e: DOMException) => {
      if (e?.name !== 'AbortError') setError(true);
    });
  }, [activeVideoUrl]);

  const hasCritical = incidents.some(
    (i) => i.status === 'active' && i.severity_level >= 4 && i.location_id === selectedCamera?.location_id
  );

  return (
    <div
      className={`glass-panel overflow-hidden transition-all duration-500 ${hasCritical ? 'glow-red' : ''}`}
      style={hasCritical ? { borderColor: 'rgba(239,68,68,0.5)' } : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Camera size={13} className="text-aegis-cyan" />
          <span className="font-mono text-xs tracking-wider">CCTV FEED</span>
          {incidentMedia && (
            <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
              <AlertTriangle size={10} />
              {incidentMedia.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="bg-white text-slate-700 text-xs border border-slate-200 rounded px-2 py-1 focus:border-aegis-cyan focus:outline-none font-mono"
            value={selectedCamera?.camera_id ?? ''}
            onChange={(e) => {
              const cam = cameras.find((c) => c.camera_id === e.target.value);
              selectCamera(cam ?? null);
            }}
          >
            <option value="">Select camera</option>
            {cameras.map((cam) => (
              <option key={cam.camera_id} value={cam.camera_id}>
                {cam.camera_id} — {cam.location_name}
              </option>
            ))}
          </select>
          {onSwitchGrid && (
            <button
              onClick={onSwitchGrid}
              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-aegis-cyan transition-colors"
              title="Grid view"
            >
              <Grid2x2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Video area */}
      <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
        <div className="scanline-overlay" />
        <div className="hud-tl hud-corner" />
        <div className="hud-tr hud-corner" />
        <div className="hud-bl hud-corner" />
        <div className="hud-br hud-corner" />

        {selectedCamera ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay loop muted playsInline
              onError={() => setError(true)}
              onLoadedData={() => setError(false)}
            />
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-black">
                <Camera size={28} className="mb-2 opacity-20" />
                <span className="text-xs font-mono">{selectedCamera.camera_id}</span>
                <span className="text-xs mt-1 opacity-40 font-mono">STREAM UNAVAILABLE</span>
              </div>
            )}
            <div className="absolute top-2 left-2 bg-red-600/90 text-white text-[10px] px-1.5 py-0.5 rounded font-mono flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </div>
            <div className="absolute top-2 right-2 text-white text-[10px] bg-black/60 px-2 py-0.5 rounded font-mono">
              {now.toLocaleTimeString()}
            </div>
            <div className="absolute bottom-2 left-2 text-aegis-cyan text-[10px] bg-black/60 px-2 py-0.5 rounded font-mono">
              {selectedCamera.camera_id}
            </div>
            <div className="absolute bottom-2 right-2 text-emerald-400 text-[10px] bg-black/60 px-2 py-0.5 rounded font-mono">
              {selectedCamera.location_name}
            </div>
            {hasCritical && (
              <div
                className="absolute inset-0 border-2 border-red-500/50 pointer-events-none"
                style={{ animation: 'border-pulse 1.5s ease-in-out infinite' }}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center text-gray-600">
            <Camera size={28} className="mb-2 opacity-20" />
            <span className="text-sm font-mono">SELECT CAMERA</span>
          </div>
        )}
      </div>
    </div>
  );
}
