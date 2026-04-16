import { useIncidents } from '../../hooks/useIncidents';
import SeverityBadge from '../shared/SeverityBadge';
import LoadingSpinner from '../shared/LoadingSpinner';
import { timeAgo } from '../../utils/formatters';
import { Video, Volume2, Database, Cpu } from 'lucide-react';
import type { Incident } from '../../types/incident';

function severityColor(level: number): string {
  return ['', '#10b981', '#84cc16', '#f59e0b', '#f97316', '#ef4444'][level] ?? '#ef4444';
}

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
      <div className="text-center text-gray-500 py-8 text-sm font-mono">
        NO ACTIVE INCIDENTS
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 overflow-y-auto">
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
  const isCritical = incident.severity_level === 5 && incident.status === 'active';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded transition-all duration-200 overflow-hidden ${
        selected ? 'glass-panel-active' : 'glass-panel hover:border-white/20'
      }`}
      style={isCritical && !selected ? { animation: 'border-pulse 2s ease-in-out infinite' } : undefined}
    >
      <div className="flex gap-0 h-full">
        {/* Severity strip */}
        <div className="w-1 shrink-0 rounded-l" style={{ backgroundColor: severityColor(incident.severity_level) }} />
        <div className="flex-1 px-3 py-2.5 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <SeverityBadge level={incident.severity_level} size="sm" />
              <span className="text-gray-300 text-xs truncate font-mono">
                {incident.location_id}
              </span>
            </div>
            <span className="text-gray-500 text-xs shrink-0 font-mono">{timeAgo(incident.created_at)}</span>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            {incident.has_video && <Video size={11} className="text-blue-400" />}
            {incident.has_audio && <Volume2 size={11} className="text-purple-400" />}
            {incident.has_sensor && <Cpu size={11} className="text-amber-400" />}
            {incident.has_log && <Database size={11} className="text-emerald-400" />}
            <span className="text-gray-500 text-xs font-mono">{incident.confidence}</span>
            <span
              className={`text-xs font-mono font-bold ml-auto ${
                incident.status === 'active'
                  ? 'text-red-400'
                  : incident.status === 'investigating'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {incident.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
