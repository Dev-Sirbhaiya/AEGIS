import { useIncidentStore } from '../../stores/incidentStore';
import SeverityBadge from '../shared/SeverityBadge';
import { timeAgo } from '../../utils/formatters';
import { Video, Volume2, Cpu, Database, AlertTriangle } from 'lucide-react';

export default function SituationCard() {
  const incident = useIncidentStore((s) => s.selectedIncident);

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-gray-600 text-sm">
        <AlertTriangle size={24} className="mb-2 opacity-40" />
        Select an incident to view details
      </div>
    );
  }

  return (
    <div className="bg-gray-800/60 rounded border border-gray-700 p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <SeverityBadge level={incident.severity_level} size="lg" />
          <p className="text-gray-400 text-xs mt-1">{incident.location_id}</p>
        </div>
        <div className="text-right">
          <div className="text-gray-500 text-xs">{timeAgo(incident.created_at)}</div>
          <div className="flex items-center gap-1.5 mt-1 justify-end">
            <span className="text-gray-500 text-xs">{incident.confidence} confidence</span>
            <div className="flex gap-1">
              {incident.has_video && <Video size={12} className="text-blue-400" />}
              {incident.has_audio && <Volume2 size={12} className="text-purple-400" />}
              {incident.has_sensor && <Cpu size={12} className="text-yellow-400" />}
              {incident.has_log && <Database size={12} className="text-green-400" />}
            </div>
          </div>
        </div>
      </div>

      {incident.explanation ? (
        <p className="text-gray-300 text-sm leading-relaxed">{incident.explanation}</p>
      ) : (
        <p className="text-gray-500 text-sm italic">Generating AI assessment...</p>
      )}

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
        <div className="flex-1 bg-gray-700 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-red-500"
            style={{ width: `${Math.round(incident.severity_score * 100)}%` }}
          />
        </div>
        <span className="text-gray-400 text-xs font-mono">
          {Math.round(incident.severity_score * 100)}%
        </span>
      </div>
    </div>
  );
}
