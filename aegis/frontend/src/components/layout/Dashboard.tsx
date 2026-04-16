import { useState, useRef, useEffect } from 'react';
import LeftPanel from '../panels/LeftPanel';
import RightPanel from '../panels/RightPanel';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useIncidentStore } from '../../stores/incidentStore';
import { useVoiceStore } from '../../stores/voiceStore';

export default function Dashboard() {
  useWebSocket();

  const [splitRatio, setSplitRatio] = useState(60);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const incidents = useIncidentStore((s) => s.incidents);
  const startDemoCall = useVoiceStore((s) => s.startDemoCall);

  // Auto-start demo voice call when running in demo/offline mode
  useEffect(() => {
    if (incidents.length > 0 && incidents[0]?.id?.startsWith('INC_DEMO_')) {
      const timer = setTimeout(() => startDemoCall(), 3000);
      return () => clearTimeout(timer);
    }
  }, [incidents.length]);

  const handleMouseDown = () => { dragging.current = true; };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitRatio(Math.max(30, Math.min(75, ratio)));
  };

  const handleMouseUp = () => { dragging.current = false; };

  return (
    <div
      ref={containerRef}
      className="flex flex-1 select-none items-start"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="p-3" style={{ width: `${splitRatio}%` }}>
        <LeftPanel />
      </div>

      <div
        className="w-px hover:bg-aegis-cyan/60 cursor-col-resize transition-colors shrink-0"
        style={{ background: '#21262d' }}
        onMouseDown={handleMouseDown}
      />

      <div className="flex-1 p-3">
        <RightPanel />
      </div>
    </div>
  );
}
