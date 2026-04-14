import { useIncidents } from '../../hooks/useIncidents';
import SeverityBadge from '../shared/SeverityBadge';
import LoadingSpinner from '../shared/LoadingSpinner';
import { timeAgo } from '../../utils/formatters';
import { Video, Volume2, Database, Cpu } from 'lucide-react';
import type { Incident } from '../../types/incident';

export default function IncidentList() {
  const { incidents, selectedIncident, loading, selectIncident } = useIncidents();

  if (loading && incidents.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8 text-sm">
        No active incidents
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto">
      {incidents.map((incident) => (
        <IncidentRow
          key={incident.id}
          incident={incident}
          selected={selectedIncident?.id === incident.id}
          onClick={() => selectIncident(incident)}
        />
      ))}
    </div>
  );
}

function IncidentRow({
  incident,
  selected,
  onClick,
}: {
  incident: Incident;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded border transition-colors ${
        selected
          ? 'bg-blue-900/40 border-blue-600'
          : 'bg-gray-800/60 border-gray-700 hover:bg-gray-700/60'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <SeverityBadge level={incident.severity_level} size="sm" />
          <span className="text-gray-300 text-xs truncate">
            {incident.location_id}
          </span>
        </div>
        <span className="text-gray-500 text-xs shrink-0">{timeAgo(incident.created_at)}</span>
      </div>

      <div className="flex items-center gap-2 mt-1">
        {incident.has_video && <Video size={12} className="text-blue-400" />}
        {incident.has_audio && <Volume2 size={12} className="text-purple-400" />}
        {incident.has_sensor && <Cpu size={12} className="text-yellow-400" />}
        {incident.has_log && <Database size={12} className="text-green-400" />}
        <span className="text-gray-500 text-xs">{incident.confidence}</span>
        <span
          className={`text-xs ml-auto ${
            incident.status === 'active'
              ? 'text-red-400'
              : incident.status === 'investigating'
              ? 'text-yellow-400'
              : 'text-green-400'
          }`}
        >
          {incident.status.toUpperCase()}
        </span>
      </div>
    </button>
  );
}
