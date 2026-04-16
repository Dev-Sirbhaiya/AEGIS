import { useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { useCameraStore } from '../../stores/cameraStore';
import { useIncidentStore } from '../../stores/incidentStore';
import { getIncidentMedia } from '../../utils/incidentMedia';

interface AudioClassification {
  label: string;
  score: number;
  color: string;
}

// Classification profiles mapped to audio file type
const CLASSIFICATIONS_BY_AUDIO: Record<string, AudioClassification[]> = {
  'terminal_crowd.wav': [
    { label: 'Crowd noise', score: 0.68, color: '#8B5CF6' },
    { label: 'Footsteps', score: 0.22, color: '#10B981' },
    { label: 'Normal ambient', score: 0.10, color: '#3B82F6' },
  ],
  'departures_hall.wav': [
    { label: 'Normal ambient', score: 0.52, color: '#3B82F6' },
    { label: 'PA announcement', score: 0.28, color: '#6366F1' },
    { label: 'Crowd noise', score: 0.20, color: '#8B5CF6' },
  ],
  'people_ambience.wav': [
    { label: 'Crowd noise', score: 0.55, color: '#8B5CF6' },
    { label: 'Normal ambient', score: 0.30, color: '#3B82F6' },
    { label: 'Footsteps', score: 0.15, color: '#10B981' },
  ],
  'jet_arrival.wav': [
    { label: 'Aircraft noise', score: 0.74, color: '#EF4444' },
    { label: 'Normal ambient', score: 0.18, color: '#3B82F6' },
    { label: 'Mechanical hum', score: 0.08, color: '#F59E0B' },
  ],
  'announcement_ding.wav': [
    { label: 'PA announcement', score: 0.80, color: '#6366F1' },
    { label: 'Normal ambient', score: 0.15, color: '#3B82F6' },
    { label: 'Crowd noise', score: 0.05, color: '#8B5CF6' },
  ],
};

const DEFAULT_CLASSIFICATION: AudioClassification[] = [
  { label: 'Normal ambient', score: 0.72, color: '#3B82F6' },
  { label: 'Crowd noise', score: 0.18, color: '#8B5CF6' },
  { label: 'PA announcement', score: 0.10, color: '#6366F1' },
];

function getClassification(audioUrl: string | undefined): AudioClassification[] {
  if (!audioUrl) return DEFAULT_CLASSIFICATION;
  const filename = audioUrl.split('/').pop() || '';
  return CLASSIFICATIONS_BY_AUDIO[filename] || DEFAULT_CLASSIFICATION;
}

export default function AudioWaveform() {
  const { media, selectedCamera } = useCameraStore();
  const selectedIncident = useIncidentStore((s) => s.selectedIncident);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  // Incident-aware override: when an incident is selected for this zone,
  // play incident audio + show classification labels that match the incident
  // type, so the recommendations panel context is reinforced via sound.
  const incidentMedia = useMemo(() => {
    if (!selectedIncident) return null;
    // Match strictly on location_id (zone_id like "T2_GATE_B4"). Don't compare
    // `zone` ("public"/"airside"/"restricted") — that's a category and would
    // light up every public camera for any public-zone incident.
    const sameZone =
      !selectedCamera ||
      selectedCamera.location_id === selectedIncident.location_id;
    if (!sameZone) return null;
    return getIncidentMedia(selectedIncident);
  }, [selectedIncident, selectedCamera]);

  const activeAudioUrl = incidentMedia
    ? `/media/audio/${incidentMedia.audio}`
    : media?.audio_url;

  const labels = incidentMedia
    ? incidentMedia.classifications
    : getClassification(media?.audio_url);

  // Initialize audio element + analyser once
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.4;
    audio.muted = true;
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioCtxRef.current?.close();
    };
  }, []);

  // Change audio source when camera/media OR incident changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeAudioUrl) return;
    audio.src = activeAudioUrl;
    audio.load();
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [activeAudioUrl]);

  const ensureAnalyser = () => {
    if (analyserRef.current || !audioRef.current) return;
    try {
      const ctx = new AudioContext();
      const source = ctx.createMediaElementSource(audioRef.current);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      audioCtxRef.current = ctx;
      sourceRef.current = source;
      analyserRef.current = analyser;
    } catch (err) {
      console.warn('Audio analyser setup failed:', err);
    }
  };

  // Canvas waveform animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let frame = 0;

    const draw = () => {
      const { width, height } = canvas;
      ctx.fillStyle = 'rgba(248,250,252,1)';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const analyser = analyserRef.current;
      if (analyser && playing) {
        // getByteTimeDomainData expects fftSize samples (not frequencyBinCount,
        // which is fftSize/2). Wrong size renders the waveform at half resolution.
        const dataArray = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(dataArray);
        const sliceWidth = width / dataArray.length;
        for (let i = 0; i < dataArray.length; i++) {
          const x = i * sliceWidth;
          const y = (dataArray[i] / 255.0) * height;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
      } else {
        // Simulated waveform fallback
        for (let x = 0; x < width; x++) {
          const t = (x + frame) * 0.05;
          const amp = Math.sin(t) * 0.4 + Math.sin(t * 2.3) * 0.2 + Math.sin(t * 0.7) * 0.1;
          const y = height / 2 + amp * (height * 0.35);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      frame += 1;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [playing]);

  const toggleMute = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    // First user interaction — set up analyser + resume AudioContext
    ensureAnalyser();
    if (audioCtxRef.current?.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    if (muted) {
      audio.muted = false;
      try {
        await audio.play();
        setPlaying(true);
      } catch (err) {
        console.warn('Audio play failed:', err);
      }
      setMuted(false);
    } else {
      audio.muted = true;
      setMuted(true);
    }
  };

  return (
    <div className="glass-panel">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Volume2 size={14} />
          <span>Audio Analysis</span>
          {selectedCamera && (
            <span className="text-[10px] text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
              {selectedCamera.camera_id}
            </span>
          )}
          {incidentMedia && (
            <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold">
              <AlertTriangle size={10} />
              {incidentMedia.label}
            </span>
          )}
        </div>
        <button
          onClick={toggleMute}
          className={`flex items-center gap-1 text-xs transition-colors px-2 py-1 rounded border ${
            muted
              ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
          }`}
          title={muted ? 'Click to unmute ambient audio' : 'Click to mute ambient audio'}
        >
          {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          {muted ? 'Unmute' : 'Playing'}
        </button>
      </div>

      <canvas ref={canvasRef} className="w-full h-16" width={400} height={64} />

      <div className="px-3 py-2 flex flex-wrap gap-3">
        {labels.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs transition-all duration-500">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.round(l.score * 60)}px`, backgroundColor: l.color }}
            />
            <span className="text-gray-400">{l.label}</span>
            <span className="text-gray-600">{Math.round(l.score * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
