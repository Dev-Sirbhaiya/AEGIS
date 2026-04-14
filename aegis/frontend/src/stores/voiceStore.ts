import { create } from 'zustand';
import type { VoiceCall, TranscriptionEntry } from '../types/incident';

interface VoiceStore {
  activeCalls: VoiceCall[];
  selectedCallId: string | null;
  transcriptions: Record<string, TranscriptionEntry[]>;
  addCall: (call: VoiceCall) => void;
  updateCall: (callId: string, updates: Partial<VoiceCall>) => void;
  removeCall: (callId: string) => void;
  addTranscription: (callId: string, entry: TranscriptionEntry) => void;
  selectCall: (callId: string | null) => void;
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  activeCalls: [],
  selectedCallId: null,
  transcriptions: {},

  addCall: (call) =>
    set((state) => ({
      activeCalls: [call, ...state.activeCalls],
      selectedCallId: state.selectedCallId ?? call.call_id,
    })),

  updateCall: (callId, updates) =>
    set((state) => ({
      activeCalls: state.activeCalls.map((c) =>
        c.call_id === callId ? { ...c, ...updates } : c
      ),
    })),

  removeCall: (callId) =>
    set((state) => ({
      activeCalls: state.activeCalls.filter((c) => c.call_id !== callId),
      selectedCallId: state.selectedCallId === callId ? null : state.selectedCallId,
    })),

  addTranscription: (callId, entry) =>
    set((state) => ({
      transcriptions: {
        ...state.transcriptions,
        [callId]: [...(state.transcriptions[callId] ?? []), entry],
      },
    })),

  selectCall: (callId) => set({ selectedCallId: callId }),
}));
