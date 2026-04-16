import { useEffect, useRef } from 'react';
import { useVoiceStore } from '../../stores/voiceStore';

export default function Transcription() {
  const { selectedCallId, transcriptions } = useVoiceStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  const entries = selectedCallId ? (transcriptions[selectedCallId] ?? []) : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  if (!selectedCallId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 text-sm font-mono">
        NO CALL SELECTED
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0"
      style={{ maskImage: 'linear-gradient(to bottom, transparent, black 20%)' }}
    >
      {entries.length === 0 && (
        <p className="text-gray-600 text-xs text-center mt-4 font-mono">WAITING FOR AUDIO...</p>
      )}
      {entries.map((entry, i) => (
        <div key={i} className={`flex ${entry.role === 'agent' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              entry.role === 'agent'
                ? 'bg-aegis-cyan/10 border border-aegis-cyan/30 text-aegis-cyan/90'
                : 'bg-white/5 border border-white/10 text-gray-200'
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
      <div ref={bottomRef} />
    </div>
  );
}
