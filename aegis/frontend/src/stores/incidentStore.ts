import { create } from 'zustand';
import type { Incident } from '../types/incident';
import api from '../services/api';
import { demoIncidents } from '../demo/data';

interface IncidentStore {
  incidents: Incident[];
  selectedIncident: Incident | null;
  loading: boolean;
  addIncident: (incident: Incident) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  selectIncident: (incident: Incident | null) => void;
  fetchIncidents: () => Promise<void>;
}

export const useIncidentStore = create<IncidentStore>((set, get) => ({
  incidents: [],
  selectedIncident: null,
  loading: false,

  addIncident: (incident) =>
    set((state) => ({
      incidents: [incident, ...state.incidents].sort(
        (a, b) => b.severity_level - a.severity_level
      ),
    })),

  updateIncident: (id, updates) =>
    set((state) => ({
      incidents: state.incidents.map((i) => (i.id === id ? { ...i, ...updates } : i)),
      selectedIncident:
        state.selectedIncident?.id === id
          ? { ...state.selectedIncident, ...updates }
          : state.selectedIncident,
    })),

  selectIncident: (incident) => set({ selectedIncident: incident }),

  fetchIncidents: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/incidents?limit=50');
      const incidents = data.incidents || [];
      set({ incidents, selectedIncident: incidents[0] ?? null });
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
      set({ incidents: demoIncidents, selectedIncident: demoIncidents[0] ?? null });
    } finally {
      set({ loading: false });
    }
  },
}));
