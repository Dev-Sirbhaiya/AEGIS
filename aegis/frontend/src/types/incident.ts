export interface RawEvent {
  id: string;
  incident_id?: string;
  timestamp: string;
  modality: 'video' | 'audio' | 'sensor' | 'log';
  source_id: string;
  event_type: string;
  anomaly_score: number;
  data: Record<string, unknown>;
  frame_path?: string;
  heatmap_path?: string;
  audio_path?: string;
}

export interface Recommendation {
  priority: number;
  action: string;
  reasoning: string;
  who: string;
}

export interface Contact {
  name: string;
  role: string;
  phone?: string;
}

export interface Incident {
  id: string;
  created_at: string;
  updated_at?: string;
  status: 'active' | 'investigating' | 'resolved';
  severity_level: 1 | 2 | 3 | 4 | 5;
  severity_score: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  terminal?: string;
  zone?: string;
  location_id: string;
  explanation: string;
  recommendations: Recommendation[];
  contacts: Contact[];
  has_video: boolean;
  has_audio: boolean;
  has_log: boolean;
  has_sensor: boolean;
  resolved_at?: string;
  resolution_notes?: string;
  response_time_seconds?: number;
  actions_taken?: string[];
  resolved_by?: string;
  events?: RawEvent[];
}

export interface TranscriptionEntry {
  role: 'caller' | 'agent';
  text: string;
  timestamp: string;
}

export interface CallSituation {
  explanation: string;
  severity_level: number;
  recommendations: Recommendation[];
  contacts: Contact[];
}

export interface VoiceCall {
  call_id: string;
  source_id: string;
  location_id: string;
  status: 'active' | 'soc_takeover' | 'ended';
  started_at: string;
  urgency_score: number;
  alert_raised: boolean;
  call_type?: 'distress' | 'patrol';
  situation?: CallSituation;
  transcriptions?: TranscriptionEntry[];
  incident_id?: string;
}
