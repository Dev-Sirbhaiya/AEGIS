import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io('/', {
      path: '/socket.io',
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });
  }
  return socket;
}

export function subscribeIncidents() {
  getSocket().emit('subscribe_incidents', {});
}

export function subscribeVoice() {
  getSocket().emit('subscribe_voice', {});
}

export function onIncidentNew(cb: (data: unknown) => void): () => void {
  getSocket().on('incident:new', cb);
  return () => { getSocket().off('incident:new', cb); };
}

export function onIncidentUpdate(cb: (data: unknown) => void): () => void {
  getSocket().on('incident:update', cb);
  return () => { getSocket().off('incident:update', cb); };
}

export function onVoiceTranscription(cb: (data: unknown) => void): () => void {
  getSocket().on('voice:transcription', cb);
  return () => { getSocket().off('voice:transcription', cb); };
}

export function onVoiceAlert(cb: (data: unknown) => void): () => void {
  getSocket().on('voice:alert', cb);
  return () => { getSocket().off('voice:alert', cb); };
}

export function onVoiceCallStarted(cb: (data: unknown) => void): () => void {
  getSocket().on('voice:call_started', cb);
  return () => { getSocket().off('voice:call_started', cb); };
}

export function onVoiceHandoff(cb: (data: unknown) => void): () => void {
  getSocket().on('voice:handoff', cb);
  return () => { getSocket().off('voice:handoff', cb); };
}

export function onSimulationEvent(cb: (data: unknown) => void): () => void {
  getSocket().on('simulation:event', cb);
  return () => { getSocket().off('simulation:event', cb); };
}

/**
 * Fires when any operator (including this one) clicks an ACT button on the
 * Recommendations panel. Lets other SOC seats see live acknowledgement of
 * recommended actions instead of every dashboard holding its own local state.
 */
export function onIncidentActionTaken(
  cb: (data: { incident_id: string; action_type: string; details: string; timestamp: string }) => void,
): () => void {
  getSocket().on('incident:action_taken', cb as (data: unknown) => void);
  return () => { getSocket().off('incident:action_taken', cb as (data: unknown) => void); };
}

export function isConnected(): boolean {
  return socket?.connected ?? false;
}
