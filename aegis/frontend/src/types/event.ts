import type { Incident, VoiceCall, TranscriptionEntry } from './incident';

export interface IncidentNewEvent {
  incident: Incident;
}

export interface IncidentUpdateEvent {
  incident_id: string;
  updates: Partial<Incident>;
}

export interface VoiceTranscriptionEvent {
  call_id: string;
  role: 'caller' | 'agent';
  text: string;
  timestamp: string;
}

export interface VoiceAlertEvent {
  call_id: string;
  location_id: string;
  urgency_score: number;
  message: string;
  timestamp: string;
}

export interface VoiceCallStartedEvent {
  call_id: string;
  source_id: string;
  location_id: string;
  location_name: string;
  started_at: string;
}

export interface VoiceHandoffEvent {
  call_id: string;
  location_id: string;
  urgency_score: number;
  conversation_history: TranscriptionEntry[];
}

export interface SimulationEvent {
  session_id: string;
  event_type: string;
  data: Record<string, unknown>;
  time_offset_seconds: number;
}
