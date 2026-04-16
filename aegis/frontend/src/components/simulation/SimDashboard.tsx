import { useEffect, useRef, useState } from 'react';
import { Camera, Clock, Radio, Volume2, VolumeX, Zap } from 'lucide-react';
import ScenarioSelect from './ScenarioSelect';
import ScoreCard from './ScoreCard';
import Debrief from './Debrief';
import type { Scenario, ScenarioEvent, SimulationSession } from '../../types/simulation';
import api from '../../services/api';
import { onSimulationEvent } from '../../services/socket';
import SeverityBadge from '../shared/SeverityBadge';
import { calculateDemoScore, createDemoDebrief, type DemoAction } from '../../demo/simulation';

type Phase = 'select' | 'active' | 'results';

const ACTION_BUTTONS = [
  { type: 'dispatch', label: 'Dispatch Patrol' },
  { type: 'call', label: 'Notify APD' },
  { type: 'alert', label: 'Sound Alarm' },
  { type: 'lock', label: 'Lock Down Zone' },
  { type: 'medical', label: 'Call Medical' },
  { type: 'evacuate', label: 'Evacuate Area' },
];

// Each scenario maps to incident-specific CCTV-style footage + matching ambience.
// The video reflects what the SOC operator would actually be seeing on the camera
// when this incident type fires, so the recommendations panel feels grounded.
const SCENARIO_MEDIA: Record<string, { video: string; audio: string; label: string }> = {
  SIM_001: { video: 'sim_unauthorized_access.mp4', audio: 'announcement_ding.wav', label: 'Unauthorized airside access' },
  SIM_002: { video: 'sim_unattended_baggage.mp4', audio: 'departures_hall.wav', label: 'Unattended baggage' },
  SIM_003: { video: 'sim_medical_emergency.mp4', audio: 'people_ambience.wav', label: 'Medical emergency' },
  SIM_004: { video: 'sim_lift_breakdown.mp4', audio: 'people_ambience.wav', label: 'Lift breakdown' },
  SIM_005: { video: 'sim_aggressive_passenger.mp4', audio: 'terminal_crowd.wav', label: 'Aggressive passenger' },
  SIM_006: { video: 'sim_fire_alarm.mp4', audio: 'announcement_ding.wav', label: 'Fire alarm' },
  SIM_007: { video: 'sim_suspicious_package.mp4', audio: 'departures_hall.wav', label: 'Suspicious package' },
  SIM_008: { video: 'sim_crowd_surge.mp4', audio: 'terminal_crowd.wav', label: 'Crowd surge' },
  SIM_009: { video: 'sim_drone_intrusion.mp4', audio: 'jet_arrival.wav', label: 'Drone intrusion' },
  SIM_010: { video: 'sim_active_threat.mp4', audio: 'announcement_ding.wav', label: 'Active threat' },
};

function SimMediaPanel({ scenarioId, isActive }: { scenarioId: string; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioMuted, setAudioMuted] = useState(true);
  const media = SCENARIO_MEDIA[scenarioId] || SCENARIO_MEDIA.SIM_001;

  useEffect(() => {
    if (!isActive) return;
    videoRef.current?.play().catch(() => {});
    if (audioRef.current) {
      audioRef.current.volume = 0.25;
      audioRef.current.muted = true;
      audioRef.current.play().catch(() => {});
    }
    return () => {
      videoRef.current?.pause();
      audioRef.current?.pause();
    };
  }, [isActive, scenarioId]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioMuted;
    if (audioMuted) audioRef.current.play().catch(() => {});
    setAudioMuted(!audioMuted);
  };

  return (
    <div className="glass-panel overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Camera size={14} />
          <span>Scenario Feed</span>
          <span className="text-[10px] text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            LIVE
          </span>
        </div>
        <button
          onClick={toggleAudio}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded bg-gray-800 hover:bg-gray-700"
        >
          {audioMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          {audioMuted ? 'Unmute' : 'Muted'}
        </button>
      </div>
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={`/media/videos/${media.video}`}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
        <audio
          ref={audioRef}
          src={`/media/audio/${media.audio}`}
          loop
        />
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded font-mono flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          REC
        </div>
        <div className="absolute top-2 right-2 text-white text-xs bg-black/60 px-2 py-0.5 rounded font-mono">
          {new Date().toLocaleTimeString()}
        </div>
        <div className="absolute bottom-2 left-2 text-white text-xs bg-black/60 px-2 py-0.5 rounded">
          SIM — {scenarioId}
        </div>
        <div className="absolute bottom-2 right-2 text-amber-300 text-xs bg-black/70 border border-amber-500/40 px-2 py-0.5 rounded font-medium">
          {media.label}
        </div>
      </div>
    </div>
  );
}

export default function SimDashboard() {
  const [phase, setPhase] = useState<Phase>('select');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [session, setSession] = useState<SimulationSession | null>(null);
  const [actions, setActions] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [deliveredEvents, setDeliveredEvents] = useState<ScenarioEvent[]>([]);
  const actionLogRef = useRef<DemoAction[]>([]);
  const timerRefs = useRef<number[]>([]);
  const localMode = !!sessionId?.startsWith('demo-');

  useEffect(() => {
    if (phase !== 'active') return;
    const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    const unsubscribe = onSimulationEvent((data: any) => {
      if (data?.session_id !== sessionId || !data?.event) return;
      setDeliveredEvents((previous) => [...previous, data.event as ScenarioEvent]);
    });
    return unsubscribe;
  }, [sessionId]);

  useEffect(() => {
    timerRefs.current.forEach((timer) => window.clearTimeout(timer));
    timerRefs.current = [];

    if (phase !== 'active' || !localMode || !scenario?.events_timeline?.length) {
      return;
    }

    setDeliveredEvents([]);
    scenario.events_timeline.forEach((event) => {
      const timer = window.setTimeout(() => {
        setDeliveredEvents((previous) => [...previous, event]);
      }, event.time_offset_seconds * 1000);
      timerRefs.current.push(timer);
    });

    return () => {
      timerRefs.current.forEach((timer) => window.clearTimeout(timer));
      timerRefs.current = [];
    };
  }, [localMode, phase, scenario]);

  const handleStart = (sid: string, sc: Scenario) => {
    setSessionId(sid);
    setScenario(sc);
    setSession(null);
    setElapsed(0);
    setActions([]);
    setDeliveredEvents([]);
    actionLogRef.current = [];
    setPhase('active');
  };

  const handleAction = async (actionType: string, details: string) => {
    if (!sessionId) return;

    if (localMode) {
      actionLogRef.current = [
        ...actionLogRef.current,
        {
          action_type: actionType,
          details,
          time_from_start_seconds: elapsed,
        },
      ];
    } else {
      await api.post('/simulation/action', {
        session_id: sessionId,
        action_type: actionType,
        details,
      });
    }

    setActions((previous) => [...previous, `${actionType}: ${details}`]);
  };

  const handleEnd = async () => {
    if (!sessionId || !scenario) return;

    timerRefs.current.forEach((timer) => window.clearTimeout(timer));
    timerRefs.current = [];

    if (localMode) {
      const firstResponse = actionLogRef.current[0]?.time_from_start_seconds ?? 999;
      const scoreBreakdown = calculateDemoScore(actionLogRef.current, scenario, firstResponse);
      setSession({
        session_id: sessionId,
        user_id: 'demo_user',
        scenario_id: scenario.scenario_id,
        scenario_data: scenario,
        started_at: new Date(Date.now() - elapsed * 1000).toISOString(),
        completed_at: new Date().toISOString(),
        status: 'completed',
        actions: actionLogRef.current.map((action) => ({
          timestamp: new Date().toISOString(),
          action_type: action.action_type,
          details: action.details,
          time_from_start_seconds: action.time_from_start_seconds,
        })),
        total_score: scoreBreakdown.total,
        response_time_seconds: firstResponse === 999 ? undefined : firstResponse,
        debrief: JSON.stringify(createDemoDebrief(scoreBreakdown.total)),
        score_breakdown: scoreBreakdown,
      });
    } else {
      const { data } = await api.post('/simulation/end', { session_id: sessionId });
      setSession(data);
    }

    setPhase('results');
  };

  const formatElapsed = (value: number) => `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;

  if (phase === 'select') {
    return (
      <div className="p-6">
        <ScenarioSelect onStart={handleStart} />
      </div>
    );
  }

  if (phase === 'results' && session) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <ScoreCard
          total={session.total_score}
          breakdown={session.score_breakdown}
          responseTime={session.response_time_seconds}
        />
        {session.debrief && <Debrief debrief={session.debrief} />}
        <button
          onClick={() => setPhase('select')}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
        >
          Try Another Scenario
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-lg font-bold">{scenario?.title}</h2>
          <div className="flex items-center gap-3 mt-1">
            {scenario && <SeverityBadge level={scenario.severity_level} size="sm" />}
            <span className="text-gray-400 text-sm capitalize">{scenario?.difficulty}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-gray-400 text-sm">
            <Clock size={14} />
            <span className="font-mono text-white">{formatElapsed(elapsed)}</span>
          </div>
          <button
            onClick={handleEnd}
            className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white text-sm font-semibold rounded"
          >
            End Scenario
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr,0.9fr] gap-4">
        {/* Left column: video feed + event feed */}
        <div className="space-y-4">
          {scenario && (
            <SimMediaPanel scenarioId={scenario.scenario_id} isActive={phase === 'active'} />
          )}

          <div className="glass-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-gray-200 text-sm font-semibold">Live Event Feed</h3>
                <p className="text-gray-500 text-xs mt-0.5">
                  {localMode ? 'Local demo playback' : 'Backend event stream'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-red-300 bg-red-950/40 border border-red-800/60 px-2 py-1 rounded">
                <Radio size={12} />
                LIVE
              </div>
            </div>

            {deliveredEvents.length === 0 ? (
              <div className="rounded border border-dashed border-gray-700 bg-gray-950/60 p-4 text-sm text-gray-500">
                Waiting for scenario events...
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {deliveredEvents.map((event, index) => {
                  const payload = event.event as Record<string, unknown>;
                  return (
                    <div key={`${event.time_offset_seconds}-${index}`} className="rounded border border-gray-700 bg-gray-950/70 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-blue-950/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-300">
                            {event.modality}
                          </span>
                          <span className="text-xs text-gray-400">{String(payload.location_id ?? 'Unknown location')}</span>
                        </div>
                        <span className="text-xs font-mono text-gray-500">+{event.time_offset_seconds}s</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-200">{String(payload.details ?? 'No event details')}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: actions */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {ACTION_BUTTONS.map((action) => {
              const colors: Record<string, string> = {
                dispatch: 'border-blue-800 text-blue-400 hover:bg-blue-950 hover:border-blue-600',
                call:     'border-purple-800 text-purple-400 hover:bg-purple-950 hover:border-purple-600',
                alert:    'border-amber-800 text-amber-400 hover:bg-amber-950 hover:border-amber-600',
                lock:     'border-red-800 text-red-400 hover:bg-red-950 hover:border-red-600',
                medical:  'border-emerald-800 text-emerald-400 hover:bg-emerald-950 hover:border-emerald-600',
                evacuate: 'border-orange-800 text-orange-400 hover:bg-orange-950 hover:border-orange-600',
              };
              return (
                <button
                  key={action.type}
                  onClick={() => handleAction(action.type, action.label)}
                  className={`flex items-center gap-2 px-4 py-3 glass-panel rounded text-sm font-mono font-medium transition-all ${colors[action.type] ?? 'border-white/10 text-gray-400'}`}
                >
                  <Zap size={13} className="opacity-70" />
                  {action.label}
                </button>
              );
            })}
          </div>

          {actions.length > 0 && (
            <div className="glass-panel p-3">
              <h3 className="text-gray-400 text-xs font-semibold uppercase mb-2">Actions Taken</h3>
              <ul className="space-y-1">
                {actions.map((action, index) => (
                  <li key={index} className="text-gray-300 text-sm flex items-center gap-2">
                    <span className="text-green-500 text-xs">OK</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
