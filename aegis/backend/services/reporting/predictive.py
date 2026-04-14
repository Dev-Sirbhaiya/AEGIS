"""
Predictive risk heatmap.

Statistical frequency analysis with exponential decay for recency weighting.
No heavy ML — frequency counts grouped by (location, hour_of_day, day_of_week).
"""
import math
from datetime import datetime
from typing import List, Dict


def predict_risk_heatmap(incidents_history: List[Dict]) -> List[Dict]:
    """
    Build a risk heatmap from historical incidents.

    Returns list of {location_id, hour, day_of_week, risk_score} entries.
    """
    if not incidents_history:
        return []

    now = datetime.utcnow()

    # Accumulate weighted counts per (location, hour) bucket
    # Key: (location_id, hour_of_day)
    bucket_scores: Dict[tuple, float] = {}

    for incident in incidents_history:
        location = incident.get("location_id")
        created = incident.get("created_at")
        severity = incident.get("severity_level", 1)

        if not location or not created:
            continue

        try:
            dt = datetime.fromisoformat(str(created).replace("Z", "+00:00"))
        except Exception:
            continue

        hour = dt.hour
        age_days = (now - dt.replace(tzinfo=None)).days

        # Exponential decay: recent incidents count more
        decay = math.exp(-0.05 * age_days)  # half-life ≈ 14 days
        weight = severity * decay

        key = (location, hour)
        bucket_scores[key] = bucket_scores.get(key, 0) + weight

    if not bucket_scores:
        return []

    # Normalize to [0, 1]
    max_score = max(bucket_scores.values())
    if max_score == 0:
        return []

    results = []
    for (location, hour), raw_score in bucket_scores.items():
        results.append({
            "location_id": location,
            "hour": hour,
            "risk_score": round(raw_score / max_score, 3),
        })

    return sorted(results, key=lambda x: x["risk_score"], reverse=True)
