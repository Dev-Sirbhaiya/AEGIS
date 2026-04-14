import { useIncidentStore } from '../../stores/incidentStore';
import { getSeverityColor } from '../../utils/severity';
import { Cpu } from 'lucide-react';

export default function SensorTimeline() {
  const incidents = useIncidentStore((s) => s.incidents);

  // Build timeline events from sensor-bearing incidents
  const events = incidents
    .filter((i) => i.has_sensor || i.has_log)
    .slice(0, 20)
    .map((i) => ({
      id: i.id,
      label: i.location_id,
      time: new Date(i.created_at).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
      severity: i.severity_level,
      type: i.has_sensor ? 'sensor' : 'log',
    }));

  return (
    <div className="bg-gray-900 rounded border border-gray-700">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700 text-sm text-gray-300">
        <Cpu size={14} />
        <span>Sensor Timeline</span>
      </div>

      <div className="px-3 py-2 max-h-28 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-gray-600 text-xs text-center py-3">No sensor events</p>
        ) : (
          <div className="space-y-1">
            {events.map((ev) => (
              <div key={ev.id} className="flex items-center gap-2 text-xs">
                <span className="text-gray-600 font-mono w-12 shrink-0">{ev.time}</span>
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: getSeverityColor(ev.severity) }}
                />
                <span className="text-gray-400 truncate">{ev.label}</span>
                <span className="text-gray-600 shrink-0 ml-auto">{ev.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
