export interface ScenarioEvent {
  time_offset_seconds: number;
  modality: string;
  event: Record<string, unknown>;
}

export interface OptimalResponse {
  primary_action: string;
  secondary_action: string;
  do_not: string;
  escalation: string;
  expected_response_time_seconds: number;
}

export interface ScoringRubric {
  response_time_30s: number;
  response_time_60s: number;
  response_time_90s: number;
  correct_primary_action: number;
  correct_secondary_action: number;
  appropriate_escalation: number;
  no_over_reaction: number;
  communication_quality: number;
}

export interface Scenario {
  scenario_id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  severity_level: number;
  duration_minutes: number;
  description: string;
  events_timeline: ScenarioEvent[];
  optimal_response: OptimalResponse;
  scoring_rubric: ScoringRubric;
}

export interface SimulationAction {
  timestamp: string;
  action_type: string;
  details: string;
  time_from_start_seconds: number;
}

export interface ScoreBreakdown {
  response_time_score: number;
  primary_action_score: number;
  secondary_action_score: number;
  escalation_score: number;
  no_overreaction_score: number;
  communication_score: number;
  total: number;
}

export interface SimulationSession {
  session_id: string;
  user_id: string;
  scenario_id: string;
  scenario_data: Scenario;
  started_at: string;
  completed_at?: string;
  status: 'active' | 'completed';
  actions: SimulationAction[];
  total_score: number;
  response_time_seconds?: number;
  debrief?: string;
  score_breakdown?: ScoreBreakdown;
}
