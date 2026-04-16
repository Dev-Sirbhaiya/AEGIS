import { useState } from 'react';
import { useVoiceStore } from '../../stores/voiceStore';
import api from '../../services/api';
import { UserCheck, PhoneOff } from 'lucide-react';

export default function CallControls() {
  const { selectedCallId, updateCall, removeCall } = useVoiceStore();
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
    <div className="flex items-center gap-2 px-3 py-2 border-t border-white/5">
      <button
        onClick={handleTakeover}
        disabled={loading === 'takeover'}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-aegis-cyan/20 hover:bg-aegis-cyan/30 border border-aegis-cyan/50 text-aegis-cyan text-xs font-mono font-bold rounded transition-all hover:shadow-[0_0_8px_rgba(232,160,32,0.45)] disabled:opacity-50"
      >
        <UserCheck size={14} />
        TAKE OVER
      </button>

      <button
        onClick={handleEnd}
        disabled={loading === 'end'}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-700 text-red-400 text-xs font-mono font-bold rounded transition-all ml-auto hover:glow-red disabled:opacity-50"
      >
        <PhoneOff size={14} />
        END CALL
      </button>
    </div>
  );
}
