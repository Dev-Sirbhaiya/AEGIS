"""Simulation scoring evaluator."""
from typing import Dict, List, Set

# Action-type synonym clusters. The dashboard emits a small fixed vocabulary
# of action_type strings ("dispatch", "call", "alert", "lock", "medical",
# "evacuate") but the scenario JSON's `optimal_response.primary_action` is
# free-form prose written by scenario authors ("notify APD immediately",
# "sound alarm and evacuate"). Without synonym expansion a clearly-correct
# action like "call" scores zero against "notify APD" because the literal
# substring check fails.
_ACTION_SYNONYMS: Dict[str, Set[str]] = {
    "dispatch": {"dispatch", "patrol", "deploy", "send", "officer", "respond"},
    "call":     {"call", "notify", "contact", "inform", "apd", "police", "scdf", "arff"},
    "alert":    {"alert", "alarm", "sound", "broadcast", "announce"},
    "lock":     {"lock", "lockdown", "seal", "close", "secure", "cordon"},
    "medical":  {"medical", "paramedic", "ambulance", "cpr", "aed", "injur"},
    "evacuate": {"evacuate", "evacuation", "clear", "disperse"},
}


def _expand_action_type(action_type: str) -> Set[str]:
    """Return the synonym cluster for an action_type, or {action_type} if unknown."""
    lower = action_type.lower().strip()
    return _ACTION_SYNONYMS.get(lower, {lower})


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

    # Expand each action_type through its synonym cluster so a "call" click
    # correctly matches an optimal response like "notify APD immediately".
    expanded_vocab: Set[str] = set()
    for at in action_types:
        expanded_vocab |= _expand_action_type(at)

    def _matches(optimal_text: str) -> bool:
        keywords = _extract_keywords(optimal_text)
        if not keywords:
            return False
        # Direct substring hit OR synonym overlap between officer-clicked
        # action types and optimal-response keywords.
        for kw in keywords:
            if kw in expanded_vocab:
                return True
            for at in action_types:
                if kw in at or at in kw:
                    return True
        return False

    primary_score = rubric.get("correct_primary_action", 30) if _matches(primary) else 0
    secondary_score = (
        rubric.get("correct_secondary_action", 20)
        if (len(actions) > 1 and _matches(secondary))
        else 0
    )

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
