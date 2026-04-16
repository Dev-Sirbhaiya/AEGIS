import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Scenario } from '../../types/simulation';
import LoadingSpinner from '../shared/LoadingSpinner';
import SeverityBadge from '../shared/SeverityBadge';
import { demoScenarios } from '../../demo/data';

interface Props {
  onStart: (sessionId: string, scenario: Scenario) => void;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: 'text-green-400 bg-green-900/30 border-green-700',
  intermediate: 'text-yellow-400 bg-yellow-900/30 border-yellow-700',
  advanced: 'text-red-400 bg-red-900/30 border-red-700',
};

export default function ScenarioSelect({ onStart }: Props) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/simulation/scenarios')
      .then(({ data }) => {
        setScenarios(data.scenarios ?? []);
      })
      .catch(() => {
        setScenarios(demoScenarios);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleStart = async (scenario: Scenario) => {
    setStarting(scenario.scenario_id);
    try {
      const { data } = await api.post('/simulation/start', {
        scenario_id: scenario.scenario_id,
        user_id: 'demo_user',
      });
      onStart(data.session_id, scenario);
    } catch {
      onStart(`demo-${scenario.scenario_id}-${Date.now()}`, scenario);
    } finally {
      setStarting(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div>
      <h2 className="text-white text-xl font-bold mb-1">Training Scenarios</h2>
      <p className="text-gray-400 text-sm mb-2">Select a scenario to begin a simulation exercise.</p>
      {scenarios === demoScenarios && (
        <div className="mb-6 inline-flex items-center gap-2 rounded border border-blue-700 bg-blue-950/40 px-3 py-1.5 text-xs text-blue-300">
          Demo mode active: running from local scenario data
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scenario) => (
          <div key={scenario.scenario_id} className="bg-gray-800 rounded-lg border border-gray-700 p-4 flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-2">
              <SeverityBadge level={scenario.severity_level} size="sm" />
              <span className={`text-xs px-2 py-0.5 rounded border font-medium ${DIFFICULTY_COLOR[scenario.difficulty]}`}>
                {scenario.difficulty}
              </span>
            </div>

            <h3 className="text-white font-semibold text-sm mb-1">{scenario.title}</h3>
            <p className="text-gray-400 text-xs flex-1 mb-3">{scenario.description}</p>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>{scenario.duration_minutes} min</span>
              <span>{scenario.scenario_id}</span>
            </div>

            <button
              onClick={() => handleStart(scenario)}
              disabled={starting === scenario.scenario_id}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded transition-colors flex items-center justify-center gap-2"
            >
              {starting === scenario.scenario_id ? <><LoadingSpinner size="sm" /> Starting...</> : 'Start Scenario'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
