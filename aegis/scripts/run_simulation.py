"""
Lightweight terminal runner for AEGIS training scenarios.

This lets you demo the simulation engine without bringing up the full
backend/frontend stack. It reuses the existing scenario JSON files and
scoring logic, then walks the operator through a timed incident flow.

Usage:
    python scripts/run_simulation.py --list
    python scripts/run_simulation.py --scenario SIM_001
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from typing import Dict, List


PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_ROOT = os.path.join(PROJECT_ROOT, "backend")
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from services.simulation.evaluator import calculate_score
from services.simulation.scenario_loader import load_scenarios


ACTION_PRESETS = [
    ("dispatch", "Dispatch patrol"),
    ("call", "Notify APD / external agency"),
    ("alert", "Raise alert or sound alarm"),
    ("lock", "Lock down zone"),
    ("medical", "Call medical response"),
    ("evacuate", "Evacuate area"),
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run an AEGIS training simulation in the terminal.")
    parser.add_argument("--list", action="store_true", help="List available scenarios and exit.")
    parser.add_argument("--scenario", help="Scenario ID to run, for example SIM_001.")
    return parser.parse_args()


def format_event(event: Dict) -> str:
    payload = event.get("event", {})
    return (
        f"[{event.get('time_offset_seconds', 0):>3}s] "
        f"{event.get('modality', 'unknown').upper()} | "
        f"{payload.get('type', 'unknown')} | "
        f"{payload.get('location_id', 'unknown')} | "
        f"{payload.get('details', 'No details provided')}"
    )


def list_scenarios(scenarios: List[Dict]) -> None:
    print("\nAvailable scenarios:\n")
    for scenario in scenarios:
        print(
            f"- {scenario['scenario_id']}: {scenario['title']} "
            f"(difficulty: {scenario['difficulty']}, severity: L{scenario['severity_level']})"
        )
    print()


def choose_scenario(scenarios: List[Dict], scenario_id: str | None) -> Dict:
    if scenario_id:
        normalized = scenario_id.strip().upper()
        for scenario in scenarios:
            if scenario["scenario_id"].upper() == normalized:
                return scenario
        raise SystemExit(f"Scenario not found: {scenario_id}")

    list_scenarios(scenarios)
    selected = input("Enter a scenario ID to run: ").strip().upper()
    for scenario in scenarios:
        if scenario["scenario_id"].upper() == selected:
            return scenario
    raise SystemExit(f"Scenario not found: {selected}")


def print_header(scenario: Dict) -> None:
    print("\n=== AEGIS Training Simulation ===")
    print(f"Scenario: {scenario['scenario_id']} - {scenario['title']}")
    print(f"Difficulty: {scenario['difficulty']} | Severity: L{scenario['severity_level']}")
    print(f"Description: {scenario.get('description', '')}")
    print("\nSuggested action shortcuts:")
    for action_type, label in ACTION_PRESETS:
        print(f"  - {action_type:<8} {label}")
    print("\nType actions as: action_type | details")
    print("Press Enter with no text to continue to the next event.")
    print("Type 'end' to finish the scenario and score it early.\n")


def collect_actions(start_time: float) -> List[Dict]:
    actions: List[Dict] = []
    while True:
        raw = input("Action> ").strip()
        if not raw:
            break
        if raw.lower() == "end":
            return actions + [{"_end": True}]

        if "|" in raw:
            action_type, details = [part.strip() for part in raw.split("|", 1)]
        else:
            action_type, details = raw, raw

        elapsed = int(time.monotonic() - start_time)
        actions.append(
            {
                "action_type": action_type.lower(),
                "details": details,
                "time": elapsed,
            }
        )
        print(f"Recorded: {action_type} at {elapsed}s")
    return actions


def default_debrief(total_score: int) -> Dict:
    if total_score >= 80:
        assessment = "Good performance. You responded effectively to the scenario."
        readiness = "Ready"
    elif total_score >= 55:
        assessment = "Adequate performance. Some key actions were taken but improvements are needed."
        readiness = "Developing"
    else:
        assessment = "Below expectations. Review the SOPs for this incident type and retrain."
        readiness = "Needs Improvement"

    return {
        "overall_assessment": assessment,
        "what_went_well": [],
        "areas_for_improvement": [],
        "key_learnings": ["Review the relevant SOP for this incident type."],
        "readiness_level": readiness,
    }


def run_scenario(scenario: Dict) -> None:
    print_header(scenario)
    actions: List[Dict] = []
    start_time = time.monotonic()

    for event in scenario.get("events_timeline", []):
        print(format_event(event))
        new_actions = collect_actions(start_time)

        if new_actions and new_actions[-1].get("_end"):
            actions.extend(new_actions[:-1])
            break

        actions.extend(new_actions)

    if not actions:
        first_response = 999
    else:
        first_response = actions[0]["time"]

    breakdown = calculate_score(
        actions=actions,
        optimal_response=scenario.get("optimal_response", {}),
        first_response_time_seconds=first_response,
        scoring_rubric=scenario.get("scoring_rubric", {}),
    )
    debrief = default_debrief(breakdown["total"])

    print("\n=== Simulation Complete ===")
    print(f"Actions recorded: {len(actions)}")
    print(f"First response time: {first_response if first_response != 999 else 'No response'}")
    print(f"Total score: {breakdown['total']}/100")
    print("\nScore breakdown:")
    for key, value in breakdown.items():
        if key == "total":
            continue
        print(f"  - {key}: {value}")

    print("\nRecommended response from scenario:")
    print(json.dumps(scenario.get("optimal_response", {}), indent=2))

    print("\nDebrief:")
    print(json.dumps(debrief, indent=2))


def main() -> None:
    args = parse_args()
    scenarios = load_scenarios()
    if not scenarios:
        raise SystemExit("No scenarios found under data/simulations/scenarios.")

    if args.list:
        list_scenarios(scenarios)
        return

    scenario = choose_scenario(scenarios, args.scenario)
    run_scenario(scenario)


if __name__ == "__main__":
    main()
