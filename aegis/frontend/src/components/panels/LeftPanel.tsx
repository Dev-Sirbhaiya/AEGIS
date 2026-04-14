import CameraFeed from './CameraFeed';
import AudioWaveform from './AudioWaveform';
import SensorTimeline from './SensorTimeline';
import IncidentList from './IncidentList';
import VoiceStatus from '../voice/VoiceStatus';

export default function LeftPanel() {
  return (
    <div className="flex flex-col gap-3 overflow-y-auto h-full pr-1">
      <CameraFeed />
      <AudioWaveform />
      <SensorTimeline />

      <div>
        <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 px-1">
          Incidents
        </h2>
        <IncidentList />
      </div>

      <VoiceStatus />
    </div>
  );
}
