import { useState } from 'react';
import { useVoiceStore } from '../../stores/voiceStore';
import api from '../../services/api';
import { UserCheck, PhoneOff, Mic, MicOff } from 'lucide-react';

export default function CallControls() {
  const { selectedCallId, updateCall, removeCall } = useVoiceStore();
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  if (!selectedCallId) return null;

  const handleTakeover = async () => {
    setLoading('takeover');
    try {
      await api.post(`/voice/takeover/${selectedCallId}`);
      updateCall(selectedCallId, { status: 'soc_takeover' });
    } catch (err) {
      console.error('Takeover failed:', err);
    } finally {
      setLoading(null);
    }
  };

  const handleEnd = async () => {
    setLoading('end');
    try {
      await api.post(`/voice/end/${selectedCallId}`);
      removeCall(selectedCallId);
    } catch (err) {
      console.error('End call failed:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-700">
      <button
        onClick={handleTakeover}
        disabled={loading === 'takeover'}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors"
      >
        <UserCheck size={14} />
        TAKE OVER
      </button>

      <button
        onClick={() => setMuted((m) => !m)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
          muted ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        {muted ? <MicOff size={14} /> : <Mic size={14} />}
        {muted ? 'MUTED' : 'MUTE'}
      </button>

      <button
        onClick={handleEnd}
        disabled={loading === 'end'}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors ml-auto"
      >
        <PhoneOff size={14} />
        END CALL
      </button>
    </div>
  );
}
