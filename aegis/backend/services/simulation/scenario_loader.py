"""Loads and validates simulation scenario JSON files."""
import json
import os
from typing import List, Dict

SCENARIOS_DIR = os.path.join(os.path.dirname(__file__), "../../../data/simulations/scenarios")


def load_scenarios(scenarios_dir: str = None) -> List[Dict]:
    """Load all scenario JSON files from the scenarios directory."""
    directory = scenarios_dir or SCENARIOS_DIR

    if not os.path.exists(directory):
        print(f"Scenarios directory not found: {directory}")
        return []

    scenarios = []
    for filename in sorted(os.listdir(directory)):
        if not filename.endswith(".json"):
            continue
        filepath = os.path.join(directory, filename)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                scenario = json.load(f)
            if _validate_scenario(scenario):
                scenarios.append(scenario)
            else:
                print(f"Warning: Invalid scenario schema in {filename}")
        except Exception as e:
            print(f"Failed to load scenario {filename}: {e}")

    return scenarios


def _validate_scenario(scenario: Dict) -> bool:
    required = ["scenario_id", "title", "difficulty", "severity_level", "events_timeline", "optimal_response"]
    return all(k in scenario for k in required)
