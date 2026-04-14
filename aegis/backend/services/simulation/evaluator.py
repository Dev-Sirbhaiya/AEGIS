"""Simulation scoring evaluator."""
from typing import Dict, List


def calculate_score(
    actions: List[Dict],
    optimal_response: Dict,
    first_response_time_seconds: int,
    scoring_rubric: Dict = None,
) -> Dict:
    """
    Score a simulation session.

    Returns a score breakdown dict with total (0-100).
    """
    rubric = scoring_rubric or {
        "response_time_30s": 10,
        "response_time_60s": 7,
        "response_time_90s": 4,
        "correct_primary_action": 30,
        "correct_secondary_action": 20,
        "appropriate_escalation": 20,
        "no_over_reaction": 10,
        "communication_quality": 10,
    }

    # Response time score
    if first_response_time_seconds <= 30:
        response_time_score = rubric.get("response_time_30s", 10)
    elif first_response_time_seconds <= 60:
        response_time_score = rubric.get("response_time_60s", 7)
    elif first_response_time_seconds <= 90:
        response_time_score = rubric.get("response_time_90s", 4)
    else:
        response_time_score = 0

    action_types = [a.get("action_type", "").lower() for a in actions]
    primary = optimal_response.get("primary_action", "").lower()
    secondary = optimal_response.get("secondary_action", "").lower()

    # Primary action match (check if any action matches key words from optimal)
    primary_keywords = _extract_keywords(primary)
    primary_score = rubric.get("correct_primary_action", 30) if any(
        any(kw in at for kw in primary_keywords) for at in action_types
    ) else 0

    # Secondary action match
    secondary_keywords = _extract_keywords(secondary)
    secondary_score = rubric.get("correct_secondary_action", 20) if (
        len(actions) > 1 and any(
            any(kw in at for kw in secondary_keywords) for at in action_types
        )
    ) else 0

    # Escalation — officer took at least 2 distinct action types
    distinct_types = set(action_types)
    escalation_score = rubric.get("appropriate_escalation", 20) if len(distinct_types) >= 2 else 0

    # No over-reaction — fewer than 6 total actions (avoid spamming)
    no_overreaction_score = rubric.get("no_over_reaction", 10) if len(actions) <= 6 else 0

    # Communication quality — placeholder (always award if any action taken)
    communication_score = rubric.get("communication_quality", 10) if len(actions) > 0 else 0

    total = (
        response_time_score
        + primary_score
        + secondary_score
        + escalation_score
        + no_overreaction_score
        + communication_score
    )

    return {
        "response_time_score": response_time_score,
        "primary_action_score": primary_score,
        "secondary_action_score": secondary_score,
        "escalation_score": escalation_score,
        "no_overreaction_score": no_overreaction_score,
        "communication_score": communication_score,
        "total": min(100, total),
    }


def _extract_keywords(text: str) -> List[str]:
    """Extract meaningful keywords from an optimal response description."""
    stop_words = {"the", "a", "an", "and", "or", "to", "of", "for", "in", "at", "is"}
    words = text.lower().split()
    return [w for w in words if len(w) > 3 and w not in stop_words]
