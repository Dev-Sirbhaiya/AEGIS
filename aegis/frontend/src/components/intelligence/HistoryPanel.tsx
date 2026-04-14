import { useIncidentStore } from '../../stores/incidentStore';
import { timeAgo } from '../../utils/formatters';
import SeverityBadge from '../shared/SeverityBadge';

export default function HistoryPanel() {
  const { incidents, selectedIncident } = useIncidentStore();

  if (!selectedIncident) return null;

  // Find resolved incidents at the same location
  const similar = incidents
    .filter(
      (i) =>
        i.id !== selectedIncident.id &&
        i.status === 'resolved' &&
        (i.location_id === selectedIncident.location_id ||
          i.severity_level === selectedIncident.severity_level)
    )
    .slice(0, 3);

  if (similar.length === 0) return null;

  return (
    <div className="mt-3">
      <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
        Similar Past Incidents
      </h3>
      <div className="flex flex-col gap-1.5">
        {similar.map((incident) => (
          <div
            key={incident.id}
            className="bg-gray-800/40 rounded border border-gray-700/60 px-3 py-2"
          >
            <div className="flex items-center gap-2 mb-1">
              <SeverityBadge level={incident.severity_level} size="sm" />
              <span className="text-gray-400 text-xs">{incident.location_id}</span>
              <span className="text-gray-600 text-xs ml-auto">{timeAgo(incident.created_at)}</span>
            </div>
            {incident.resolution_notes && (
              <p className="text-gray-500 text-xs italic">{incident.resolution_notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
