import { useEffect } from 'react';
import { useIncidentStore } from '../stores/incidentStore';
import type { Incident } from '../types/incident';

export function useIncidents() {
  const { incidents, selectedIncident, loading, fetchIncidents, selectIncident } =
    useIncidentStore();

  useEffect(() => {
    fetchIncidents();
  }, []);

  const sorted = [...incidents].sort((a, b) => {
    if (b.severity_level !== a.severity_level) return b.severity_level - a.severity_level;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return { incidents: sorted, selectedIncident, loading, selectIncident, fetchIncidents };
}
