import { useState, useRef } from 'react';
import LeftPanel from '../panels/LeftPanel';
import RightPanel from '../panels/RightPanel';
import { useWebSocket } from '../../hooks/useWebSocket';

export default function Dashboard() {
  useWebSocket();

  const [splitRatio, setSplitRatio] = useState(60); // left panel width %
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMouseDown = () => {
    dragging.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitRatio(Math.max(30, Math.min(75, ratio)));
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-1 overflow-hidden select-none min-h-0"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Left panel */}
      <div
        className="overflow-hidden p-3"
        style={{ width: `${splitRatio}%` }}
      >
        <LeftPanel />
      </div>

      {/* Resizable divider */}
      <div
        className="w-1 bg-gray-700 hover:bg-blue-600 cursor-col-resize transition-colors shrink-0"
        onMouseDown={handleMouseDown}
      />

      {/* Right panel */}
      <div className="flex-1 overflow-hidden p-3">
        <RightPanel />
      </div>
    </div>
  );
}
