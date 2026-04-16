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
  beginner: 'text-green-700 bg-green-50 border-green-200',
  intermediate: 'text-amber-700 bg-amber-50 border-amber-200',
  advanced: 'text-red-700 bg-red-50 border-red-200',
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
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 text-2xl font-bold mb-1">Training Scenarios</h2>
        <p className="text-slate-600 text-sm max-w-2xl">
          Choose a scenario to rehearse the response, review the event stream, and practice proportionate action-taking.
        </p>
      </div>
      {scenarios === demoScenarios && (
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
          Demo mode active: running from local scenario data
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scenario) => (
          <div key={scenario.scenario_id} className="glass-panel card-hover p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <SeverityBadge level={scenario.severity_level} size="sm" />
              <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${DIFFICULTY_COLOR[scenario.difficulty]}`}>
                {scenario.difficulty}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-slate-900 font-semibold text-base">{scenario.title}</h3>
              <p className="text-slate-600 text-sm leading-6 flex-1">{scenario.description}</p>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{scenario.duration_minutes} min</span>
              <span className="font-data text-xs">{scenario.scenario_id}</span>
            </div>

            <button
              onClick={() => handleStart(scenario)}
              disabled={starting === scenario.scenario_id}
              className="button-primary w-full py-2.5 text-sm disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
            >
              {starting === scenario.scenario_id ? <><LoadingSpinner size="sm" /> Starting...</> : 'Start Scenario'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
