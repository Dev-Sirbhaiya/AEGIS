"""
Severity level definitions for AEGIS incidents.

Levels 1-5 with display metadata, color codes, and response time targets.
"""
from typing import Dict, Any

SEVERITY_LEVELS: Dict[int, Dict[str, Any]] = {
    1: {
        "level": 1,
        "name": "Minimal",
        "color": "#16A34A",
        "color_bg": "#DCFCE7",
        "description": "Minor anomaly, no immediate threat. Monitor and log.",
        "examples": [
            "Brief queue at check-in",
            "Single failed badge scan (likely card error)",
            "Minor escalator fault, no passengers affected",
        ],
        "response_time_target_seconds": 600,
    },
    2: {
        "level": 2,
        "name": "Low",
        "color": "#65A30D",
        "color_bg": "#ECFCCB",
        "description": "Low-level anomaly requiring monitoring. Dispatch officer to verify.",
        "examples": [
            "Lift breakdown with trapped passengers",
            "Mild crowd density increase",
            "Repeated badge scan failures at same gate",
        ],
        "response_time_target_seconds": 300,
    },
    3: {
        "level": 3,
        "name": "Moderate",
        "color": "#D97706",
        "color_bg": "#FEF3C7",
        "description": "Active situation requiring officer response and supervisor notification.",
        "examples": [
            "Medical emergency — patient responsive",
            "Unattended bag (no suspicious features)",
            "Verbal altercation between passengers",
            "Crowd density exceeding threshold",
        ],
        "response_time_target_seconds": 120,
    },
    4: {
        "level": 4,
        "name": "High",
        "color": "#EA580C",
        "color_bg": "#FFEDD5",
        "description": "Serious incident requiring immediate multi-unit response and management notification.",
        "examples": [
            "Unauthorized airside access confirmed",
            "Unattended bag with suspicious features",
            "Physical assault on staff or passenger",
            "Fire alarm with visual confirmation of smoke",
            "Drone incursion near airport boundary",
        ],
        "response_time_target_seconds": 60,
    },
    5: {
        "level": 5,
        "name": "Critical",
        "color": "#DC2626",
        "color_bg": "#FEE2E2",
        "description": "Critical threat to life, aircraft, or airport infrastructure. All agencies activated.",
        "examples": [
            "Active armed threat in terminal",
            "Bomb threat with credible indicators",
            "Aircraft fire on apron",
            "Drone on runway centerline",
            "Mass casualty event",
        ],
        "response_time_target_seconds": 30,
    },
}


def get_severity_info(level: int) -> Dict[str, Any]:
    """Return severity metadata for a given level (1-5). Clamps to valid range."""
    level = max(1, min(5, level))
    return SEVERITY_LEVELS[level]


def score_to_level(score: float) -> int:
    """Convert a continuous anomaly score [0.0, 1.0] to severity level 1-5."""
    if score >= 0.90:
        return 5
    elif score >= 0.75:
        return 4
    elif score >= 0.50:
        return 3
    elif score >= 0.25:
        return 2
    else:
        return 1
