import SituationCard from '../intelligence/SituationCard';
import ActionList from '../intelligence/ActionList';
import ContactCard from '../intelligence/ContactCard';
import HistoryPanel from '../intelligence/HistoryPanel';
import Transcription from '../voice/Transcription';
import CallControls from '../voice/CallControls';
import { useVoiceStore } from '../../stores/voiceStore';

export default function RightPanel() {
  const { activeCalls } = useVoiceStore();
  const hasActiveCall = activeCalls.length > 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Intelligence section */}
      <div className="flex-1 overflow-y-auto pr-1 pb-3 space-y-3 min-h-0">
        <SituationCard />
        <ActionList />
        <ContactCard />
        <HistoryPanel />
      </div>

      {/* Voice panel — shown when calls are active */}
      {hasActiveCall && (
        <div className="flex flex-col border-t border-white/5 mt-2 pt-2 min-h-0 max-h-64">
          <div className="px-3 py-1.5 text-xs text-gray-400 font-mono font-semibold uppercase tracking-widest">
            Voice Agent
          </div>
          <Transcription />
          <CallControls />
        </div>
      )}
    </div>
  );
}
