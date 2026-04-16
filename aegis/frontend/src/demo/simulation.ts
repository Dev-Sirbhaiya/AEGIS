import type { Scenario, ScoreBreakdown } from '../types/simulation';

export interface DemoAction {
  action_type: string;
  details: string;
  time_from_start_seconds: number;
}

export function calculateDemoScore(
  actions: DemoAction[],
  scenario: Scenario,
  firstResponseTimeSeconds: number
): ScoreBreakdown {
  const rubric = scenario.scoring_rubric;
  const actionTypes = actions.map((action) => action.action_type.toLowerCase());
  const primaryKeywords = extractKeywords(scenario.optimal_response.primary_action);
  const secondaryKeywords = extractKeywords(scenario.optimal_response.secondary_action);

  let responseTimeScore = 0;
  if (firstResponseTimeSeconds <= 30) {
    responseTimeScore = rubric.response_time_30s;
  } else if (firstResponseTimeSeconds <= 60) {
    responseTimeScore = rubric.response_time_60s;
  } else if (firstResponseTimeSeconds <= 90) {
    responseTimeScore = rubric.response_time_90s;
  }

  const primaryActionScore = actionTypes.some((actionType) =>
    primaryKeywords.some((keyword) => actionType.includes(keyword))
  )
    ? rubric.correct_primary_action
    : 0;

  const secondaryActionScore =
    actions.length > 1 &&
    actionTypes.some((actionType) => secondaryKeywords.some((keyword) => actionType.includes(keyword)))
      ? rubric.correct_secondary_action
      : 0;

  const escalationScore = new Set(actionTypes).size >= 2 ? rubric.appropriate_escalation : 0;
  const noOverreactionScore = actions.length <= 6 ? rubric.no_over_reaction : 0;
  const communicationScore = actions.length > 0 ? rubric.communication_quality : 0;

  const total = Math.min(
    100,
    responseTimeScore +
      primaryActionScore +
      secondaryActionScore +
      escalationScore +
      noOverreactionScore +
      communicationScore
  );

  return {
    response_time_score: responseTimeScore,
    primary_action_score: primaryActionScore,
    secondary_action_score: secondaryActionScore,
    escalation_score: escalationScore,
    no_overreaction_score: noOverreactionScore,
    communication_score: communicationScore,
    total,
  };
}

export function createDemoDebrief(totalScore: number) {
  if (totalScore >= 80) {
    return {
      overall_assessment: 'Good performance. You responded effectively and proportionately to the scenario.',
      what_went_well: ['Response sequence matched the highest-priority operational need.'],
      areas_for_improvement: [],
      key_learnings: ['Keep early escalation concise and paired with location-specific actioning.'],
      readiness_level: 'Ready',
    };
  }

  if (totalScore >= 55) {
    return {
      overall_assessment: 'Adequate performance. Core actions were taken, but the response could be faster or more complete.',
      what_went_well: ['You took action instead of waiting for perfect certainty.'],
      areas_for_improvement: [
        {
          issue: 'Secondary actions were either delayed or omitted.',
          correct_action: 'Pair the first response with the most relevant follow-up control action.',
        },
      ],
      key_learnings: ['Use the SOP sequence: stabilize, contain, escalate, communicate.'],
      readiness_level: 'Developing',
    };
  }

  return {
    overall_assessment: 'Below expectations. The response did not adequately align with the scenario SOP.',
    what_went_well: [],
    areas_for_improvement: [
      {
        issue: 'Critical first actions were missing or too slow.',
        correct_action: 'Prioritize the primary protective action within the first 30 seconds.',
      },
    ],
    key_learnings: ['Review this incident type before the next drill.'],
    readiness_level: 'Needs Improvement',
  };
}

function extractKeywords(text: string) {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'to', 'of', 'for', 'in', 'at', 'is', 'via']);
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z0-9_]/g, ''))
    .filter((word) => word.length > 3 && !stopWords.has(word));
}
