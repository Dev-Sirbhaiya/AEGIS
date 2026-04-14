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
import type { Incident, VoiceCall } from '../types/incident';

export function useWebSocket() {
  const addIncident = useIncidentStore((s) => s.addIncident);
  const updateIncident = useIncidentStore((s) => s.updateIncident);
  const addCall = useVoiceStore((s) => s.addCall);
  const updateCall = useVoiceStore((s) => s.updateCall);
  const addTranscription = useVoiceStore((s) => s.addTranscription);

  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      subscribeIncidents();
      subscribeVoice();
    });

    // Subscribe immediately if already connected
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
      if (data?.call_id) {
        updateCall(data.call_id, { alert_raised: true, urgency_score: data.urgency_score });
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
