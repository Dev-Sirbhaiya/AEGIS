import { useEffect, useRef } from 'react';
import { useVoiceStore } from '../../stores/voiceStore';

export default function Transcription() {
  const { selectedCallId, transcriptions } = useVoiceStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const entries = selectedCallId ? (transcriptions[selectedCallId] ?? []) : [];

  // Scroll the transcript container itself to the bottom when a new line
  // arrives. We deliberately do NOT use `scrollIntoView` because that scrolls
  // EVERY scroll ancestor to bring the sentinel into view — which yanks the
  // entire dashboard down the moment the voice agent speaks and traps the
  // operator at the bottom of the page. Only scroll if the operator is
  // already near the bottom, so scrolling up to re-read earlier lines sticks.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 80) {
      el.scrollTop = el.scrollHeight;
    }
  }, [entries.length]);

  if (!selectedCallId) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-mono">
        NO CALL SELECTED
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0"
    >
      {entries.length === 0 && (
        <p className="text-slate-400 text-xs text-center mt-4 font-mono">WAITING FOR AUDIO...</p>
      )}
      {entries.map((entry, i) => (
        <div key={i} className={`flex ${entry.role === 'agent' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              entry.role === 'agent'
                ? 'bg-blue-50 border border-blue-200 text-blue-800'
                : 'bg-slate-50 border border-slate-200 text-slate-800'
            }`}
          >
            <div className="text-[10px] font-mono opacity-60 mb-1 tracking-wide">
              {entry.role === 'agent' ? 'AEGIS VOICE' : 'CALLER'}
              {' · '}
              {new Date(entry.timestamp).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            {entry.text}
          </div>
        </div>
      ))}
    </div>
  );
}
