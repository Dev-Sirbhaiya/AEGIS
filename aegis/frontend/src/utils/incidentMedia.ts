/**
 * Maps an incident (from incidentStore.selectedIncident) to incident-relevant
 * CCTV-style video + airport ambience audio.
 *
 * The CameraFeed and AudioWaveform components use this so that when a SOC
 * operator selects an incident and reads the Recommendations panel, the
 * video/audio they see/hear actually matches the incident type — making the
 * recommendations feel grounded in real footage.
 */
import type { Incident } from '../types/incident';

export interface IncidentMedia {
  video: string;
  audio: string;
  label: string;
  classifications: { label: string; score: number; color: string }[];
}

const INCIDENT_TYPES: {
  key: string;
  match: RegExp;
  media: IncidentMedia;
}[] = [
  {
    key: 'fire',
    match: /\b(fire|smoke|burn|flame|scdf|arff)\b/i,
    media: {
      video: 'sim_fire_alarm.mp4',
      audio: 'announcement_ding.wav',
      label: 'Fire / smoke detected',
      classifications: [
        { label: 'Fire alarm', score: 0.82, color: '#EF4444' },
        { label: 'Crowd panic', score: 0.65, color: '#F59E0B' },
        { label: 'PA announcement', score: 0.45, color: '#6366F1' },
      ],
    },
  },
  {
    key: 'active_threat',
    match: /\b(active threat|armed|gunman|shooter|weapon|hostage)\b/i,
    media: {
      video: 'sim_active_threat.mp4',
      audio: 'announcement_ding.wav',
      label: 'Active threat',
      classifications: [
        { label: 'Aggressive shouting', score: 0.78, color: '#EF4444' },
        { label: 'Crowd panic', score: 0.71, color: '#F59E0B' },
        { label: 'Footsteps / running', score: 0.55, color: '#10B981' },
      ],
    },
  },
  {
    key: 'unauthorized_access',
    match: /\b(unauthor|airside|breach|access[- ]control|tailgat|door alarm)\b/i,
    media: {
      video: 'sim_unauthorized_access.mp4',
      audio: 'announcement_ding.wav',
      label: 'Unauthorized access attempt',
      classifications: [
        { label: 'Door alarm', score: 0.74, color: '#EF4444' },
        { label: 'Footsteps', score: 0.42, color: '#10B981' },
        { label: 'Normal ambient', score: 0.18, color: '#3B82F6' },
      ],
    },
  },
  {
    key: 'unattended_baggage',
    match: /\b(unattended|abandoned|baggage|suitcase|luggage|bdu)\b/i,
    media: {
      video: 'sim_unattended_baggage.mp4',
      audio: 'departures_hall.wav',
      label: 'Unattended baggage',
      classifications: [
        { label: 'Normal ambient', score: 0.62, color: '#3B82F6' },
        { label: 'Crowd noise', score: 0.28, color: '#8B5CF6' },
        { label: 'PA announcement', score: 0.10, color: '#6366F1' },
      ],
    },
  },
  {
    key: 'medical',
    match: /\b(medical|collapsed|cpr|paramedic|ambulance|injur|cardiac)\b/i,
    media: {
      video: 'sim_medical_emergency.mp4',
      audio: 'people_ambience.wav',
      label: 'Medical emergency',
      classifications: [
        { label: 'Distress voice', score: 0.71, color: '#EF4444' },
        { label: 'Crowd noise', score: 0.42, color: '#8B5CF6' },
        { label: 'Normal ambient', score: 0.20, color: '#3B82F6' },
      ],
    },
  },
  {
    key: 'lift',
    match: /\b(lift|elevator|trapped|stuck)\b/i,
    media: {
      video: 'sim_lift_breakdown.mp4',
      audio: 'people_ambience.wav',
      label: 'Lift breakdown',
      classifications: [
        { label: 'Distress voice', score: 0.55, color: '#EF4444' },
        { label: 'Mechanical hum', score: 0.40, color: '#F59E0B' },
        { label: 'Normal ambient', score: 0.25, color: '#3B82F6' },
      ],
    },
  },
  {
    key: 'aggressive',
    match: /\b(aggressive|argument|altercation|fight|confront|assault|shouting)\b/i,
    media: {
      video: 'sim_aggressive_passenger.mp4',
      audio: 'terminal_crowd.wav',
      label: 'Aggressive passenger',
      classifications: [
        { label: 'Aggressive shouting', score: 0.81, color: '#EF4444' },
        { label: 'Crowd noise', score: 0.55, color: '#8B5CF6' },
        { label: 'Footsteps', score: 0.20, color: '#10B981' },
      ],
    },
  },
  {
    key: 'bomb',
    match: /\b(bomb|suspicious package|ied|explosive)\b/i,
    media: {
      video: 'sim_suspicious_package.mp4',
      audio: 'departures_hall.wav',
      label: 'Suspicious package',
      classifications: [
        { label: 'Cordon perimeter', score: 0.70, color: '#EF4444' },
        { label: 'Normal ambient', score: 0.45, color: '#3B82F6' },
        { label: 'PA announcement', score: 0.30, color: '#6366F1' },
      ],
    },
  },
  {
    key: 'crowd',
    match: /\b(crowd|surge|stampede|cancellation|congestion|rebooking)\b/i,
    media: {
      video: 'sim_crowd_surge.mp4',
      audio: 'terminal_crowd.wav',
      label: 'Crowd surge',
      classifications: [
        { label: 'Crowd noise', score: 0.86, color: '#8B5CF6' },
        { label: 'Distress voice', score: 0.42, color: '#EF4444' },
        { label: 'PA announcement', score: 0.30, color: '#6366F1' },
      ],
    },
  },
  {
    key: 'drone',
    match: /\b(drone|uav|quadcopter|airspace)\b/i,
    media: {
      video: 'sim_drone_intrusion.mp4',
      audio: 'jet_arrival.wav',
      label: 'Drone intrusion',
      classifications: [
        { label: 'Aircraft noise', score: 0.74, color: '#EF4444' },
        { label: 'Mechanical hum', score: 0.38, color: '#F59E0B' },
        { label: 'Normal ambient', score: 0.18, color: '#3B82F6' },
      ],
    },
  },
];

/**
 * Pick the best-matching incident profile based on text fields of the incident.
 * Searches: explanation, recommendations[*].action, recommendations[*].reasoning.
 * Scores by hit count (distinct keyword occurrences) so the most-specific type
 * wins when multiple regexes match (e.g. "armed unauthorized intruder" →
 * active_threat, not unauthorized_access). Returns null if nothing matches.
 */
export function getIncidentMedia(incident: Incident | null | undefined): IncidentMedia | null {
  if (!incident) return null;
  const corpus = [
    incident.explanation ?? '',
    ...(incident.recommendations ?? []).flatMap((r) => [r.action, r.reasoning]),
  ]
    .join(' ')
    .toLowerCase();

  let bestScore = 0;
  let best: IncidentMedia | null = null;
  for (const t of INCIDENT_TYPES) {
    // Use a global-flagged variant so we count all hits, not just the first.
    const globalRe = new RegExp(t.match.source, t.match.flags.includes('g') ? t.match.flags : t.match.flags + 'g');
    const hits = (corpus.match(globalRe) ?? []).length;
    if (hits > bestScore) {
      bestScore = hits;
      best = t.media;
    }
  }
  return best;
}
