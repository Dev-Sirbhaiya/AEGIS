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
      <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
        No call selected
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
      {entries.length === 0 && (
        <p className="text-gray-600 text-xs text-center mt-4">Waiting for audio...</p>
      )}
      {entries.map((entry, i) => (
        <div key={i} className={`flex ${entry.role === 'agent' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              entry.role === 'agent'
                ? 'bg-blue-800 text-blue-100'
                : 'bg-gray-700 text-gray-200'
            }`}
          >
            <div className="text-xs opacity-60 mb-1">
              {entry.role === 'agent' ? 'AEGIS Voice' : 'Caller'}
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
