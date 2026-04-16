import { useState } from 'react';
import CameraFeed from './CameraFeed';
import CameraGrid from './CameraGrid';
import { useCameraStore } from '../../stores/cameraStore';
import AudioWaveform from './AudioWaveform';
import SensorTimeline from './SensorTimeline';
import IncidentList from './IncidentList';
import VoiceStatus from '../voice/VoiceStatus';
import TerminalMap from '../map/TerminalMap';

type CameraView = 'feed' | 'grid' | 'map';

export default function LeftPanel() {
  const [cameraView, setCameraView] = useState<CameraView>('feed');
  const cameras = useCameraStore((s) => s.cameras);
  const selectCamera = useCameraStore((s) => s.selectCamera);

  const handleSelectFromGrid = (locationId: string) => {
    const cam = cameras.find((c) => c.location_id === locationId);
    if (cam) selectCamera(cam);
    setCameraView('feed');
  };

  return (
    <div className="flex flex-col gap-3 overflow-y-auto h-full pr-1">
      {/* Camera view toggle tabs */}
      <div>
        <div className="flex gap-1 mb-2">
          {(['feed', 'grid', 'map'] as CameraView[]).map((view) => (
            <button
              key={view}
              onClick={() => setCameraView(view)}
              className={`px-3 py-1 text-[10px] font-mono font-semibold rounded tracking-widest transition-all duration-200 ${
                cameraView === view
                  ? 'bg-blue-50 border border-blue-200 text-aegis-cyan'
                  : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {view === 'feed' ? 'FEED' : view === 'grid' ? 'GRID' : 'MAP'}
            </button>
          ))}
        </div>
        {cameraView === 'feed' && <CameraFeed onSwitchGrid={() => setCameraView('grid')} />}
        {cameraView === 'grid' && <CameraGrid onExpand={() => setCameraView('feed')} onSelectCamera={handleSelectFromGrid} />}
        {cameraView === 'map'  && <TerminalMap />}
      </div>

      <AudioWaveform />
      <SensorTimeline />

      <div>
        <h2 className="text-slate-400 text-[10px] font-mono font-semibold uppercase tracking-widest mb-1.5 px-1">
          Active Incidents
        </h2>
        <IncidentList />
      </div>

      <VoiceStatus />
    </div>
  );
}
