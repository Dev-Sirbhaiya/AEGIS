import { useState, useEffect } from 'react';
import ScenarioSelect from './ScenarioSelect';
import ScoreCard from './ScoreCard';
import Debrief from './Debrief';
import type { Scenario, SimulationSession } from '../../types/simulation';
import api from '../../services/api';
import { getSocket, onSimulationEvent } from '../../services/socket';
import { useIncidentStore } from '../../stores/incidentStore';
import SeverityBadge from '../shared/SeverityBadge';
import { Clock, Zap } from 'lucide-react';

type Phase = 'select' | 'active' | 'results';

export default function SimDashboard() {
  const [phase, setPhase] = useState<Phase>('select');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [session, setSession] = useState<SimulationSession | null>(null);
  const [actions, setActions] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const addIncident = useIncidentStore((s) => s.addIncident);

  // Timer
  useEffect(() => {
    if (phase !== 'active') return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Listen for simulation events
  useEffect(() => {
    const off = onSimulationEvent((data: any) => {
      if (data?.session_id !== sessionId) return;
      // Simulation events can spawn incidents — handled by incident store via WS
      console.log('Sim event:', data);
    });
    return off;
  }, [sessionId]);

  const handleStart = (sid: string, sc: Scenario) => {
    setSessionId(sid);
    setScenario(sc);
    setElapsed(0);
    setActions([]);
    setPhase('active');
  };

  const handleAction = async (actionType: string, details: string) => {
    if (!sessionId) return;
    await api.post('/simulation/action', { session_id: sessionId, action_type: actionType, details });
    setActions((prev) => [...prev, `${actionType}: ${details}`]);
  };

  const handleEnd = async () => {
    if (!sessionId) return;
    const { data } = await api.post('/simulation/end', { session_id: sessionId });
    setSession(data);
    setPhase('results');
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

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

  // Active simulation
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
            <span className="font-mono text-white">{fmt(elapsed)}</span>
          </div>
          <button
            onClick={handleEnd}
            className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white text-sm font-semibold rounded"
          >
            End Scenario
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { type: 'dispatch', label: 'Dispatch Patrol' },
          { type: 'call', label: 'Notify APD' },
          { type: 'alert', label: 'Sound Alarm' },
          { type: 'lock', label: 'Lock Down Zone' },
          { type: 'medical', label: 'Call Medical' },
          { type: 'evacuate', label: 'Evacuate Area' },
        ].map((action) => (
          <button
            key={action.type}
            onClick={() => handleAction(action.type, action.label)}
            className="flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-gray-300 text-sm font-medium transition-colors"
          >
            <Zap size={14} className="text-yellow-400" />
            {action.label}
          </button>
        ))}
      </div>

      {actions.length > 0 && (
        <div className="bg-gray-800 rounded border border-gray-700 p-3">
          <h3 className="text-gray-400 text-xs font-semibold uppercase mb-2">Actions Taken</h3>
          <ul className="space-y-1">
            {actions.map((a, i) => (
              <li key={i} className="text-gray-300 text-sm flex items-center gap-2">
                <span className="text-green-500 text-xs">✓</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
