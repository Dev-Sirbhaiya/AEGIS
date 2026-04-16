import { useEffect } from 'react';
import {
  getSocket,
  subscribeIncidents,
  subscribeVoice,
  onIncidentNew,
  onIncidentUpdate,
  onVoiceCallStarted,
  onVoiceTranscription,
  onVoiceAlert,
  onVoiceHandoff,
} from '../services/socket';
import { useIncidentStore } from '../stores/incidentStore';
import { useVoiceStore } from '../stores/voiceStore';
import type { Incident, VoiceCall, CallSituation } from '../types/incident';

export function useWebSocket() {
  const addIncident = useIncidentStore((s) => s.addIncident);
  const updateIncident = useIncidentStore((s) => s.updateIncident);
  const selectIncident = useIncidentStore((s) => s.selectIncident);
  const addCall = useVoiceStore((s) => s.addCall);
  const updateCall = useVoiceStore((s) => s.updateCall);
  const addTranscription = useVoiceStore((s) => s.addTranscription);

  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      subscribeIncidents();
      subscribeVoice();
    });

    if (socket.connected) {
      subscribeIncidents();
      subscribeVoice();
    }

    const offNew = onIncidentNew((data: any) => {
      if (data?.incident) addIncident(data.incident as Incident);
    });

    const offUpdate = onIncidentUpdate((data: any) => {
      if (data?.incident_id) updateIncident(data.incident_id, data.updates ?? {});
    });

    const offCallStarted = onVoiceCallStarted((data: any) => {
      if (data?.call_id) {
        addCall({
          call_id: data.call_id,
          source_id: data.source_id,
          location_id: data.location_id,
          call_type: (data.call_type ?? 'distress') as 'distress' | 'patrol',
          status: 'active',
          started_at: data.started_at,
          urgency_score: 0,
          alert_raised: false,
        } as VoiceCall);
      }
    });

    const offTranscription = onVoiceTranscription((data: any) => {
      if (data?.call_id) {
        addTranscription(data.call_id, {
          role: data.role,
          text: data.text,
          timestamp: data.timestamp,
        });
      }
    });

    const offAlert = onVoiceAlert((data: any) => {
      if (!data?.call_id) return;

      const situation: CallSituation | undefined = data.situation ?? undefined;

      // Update the call with urgency + call_type + AI-generated situation
      updateCall(data.call_id, {
        alert_raised: true,
        urgency_score: data.urgency_score,
        call_type: (data.call_type ?? 'distress') as 'distress' | 'patrol',
        situation,
      });

      // If the agent produced structured intelligence, surface it in the
      // incident intelligence panels by creating a synthetic incident.
      // This lets SituationCard / ActionList / ContactCard show live call data
      // without needing a separate fusion event.
      if (situation && data.location_id) {
        const syntheticId = `CALL_${data.call_id}`;
        const sevLevel = Math.max(1, Math.min(5, situation.severity_level ?? 3)) as 1|2|3|4|5;
        const synthetic: Incident = {
          id: syntheticId,
          created_at: data.timestamp ?? new Date().toISOString(),
          status: 'active',
          severity_level: sevLevel,
          severity_score: Math.round((data.urgency_score ?? 0.5) * 100),
          confidence: data.urgency_score >= 0.8 ? 'HIGH' : data.urgency_score >= 0.5 ? 'MEDIUM' : 'LOW',
          terminal: undefined,
          zone: undefined,
          location_id: data.location_id,
          explanation: situation.explanation,
          recommendations: situation.recommendations ?? [],
          contacts: situation.contacts ?? [],
          has_video: true,
          has_audio: true,
          has_log: false,
          has_sensor: false,
        };

        // Add or update so re-alerts on the same call don't duplicate
        const store = useIncidentStore.getState();
        if (store.incidents.some((i) => i.id === syntheticId)) {
          updateIncident(syntheticId, {
            explanation: situation.explanation,
            severity_level: sevLevel,
            recommendations: situation.recommendations ?? [],
            contacts: situation.contacts ?? [],
          });
        } else {
          addIncident(synthetic);
        }

        // Auto-select so the intelligence panels immediately show the call
        selectIncident(synthetic);
      }
    });

    const offHandoff = onVoiceHandoff((data: any) => {
      if (data?.call_id) {
        updateCall(data.call_id, { status: 'soc_takeover' });
      }
    });

    return () => {
      offNew();
      offUpdate();
      offCallStarted();
      offTranscription();
      offAlert();
      offHandoff();
    };
  }, []);
}
