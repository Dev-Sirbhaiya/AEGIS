"""
Knowledge graph for Changi Airport spatial relationships.

Loads changi_zones.json and provides spatial correlation functions
used by the fusion engine to correlate events across adjacent locations.
"""
import json
import os
from typing import Dict, List, Optional, Any
from config.settings import settings


class KnowledgeGraph:
    def __init__(self):
        self._zones: Dict[str, Any] = {}
        self._loaded = False

    def load(self):
        """Load zone data from changi_zones.json."""
        zones_path = os.path.join(settings.KNOWLEDGE_BASE_PATH, "locations", "changi_zones.json")
        try:
            with open(zones_path, "r") as f:
                data = json.load(f)
            self._zones = data.get("zones", {})
            self._loaded = True
            print(f"Knowledge graph loaded: {len(self._zones)} zones")
        except FileNotFoundError:
            print(f"Warning: changi_zones.json not found at {zones_path}. Using empty graph.")
            self._zones = {}
        except Exception as e:
            print(f"Knowledge graph load failed: {e}. Using empty graph.")
            self._zones = {}

    def get_location(self, location_id: str) -> Optional[Dict]:
        """Get full zone data for a location."""
        return self._zones.get(location_id)

    def get_cameras_for_location(self, location_id: str) -> List[str]:
        """Return camera IDs covering a location."""
        zone = self._zones.get(location_id, {})
        return zone.get("cameras", [])

    def get_nearest_responders(self, location_id: str) -> List[Dict]:
        """Return nearest responder units for a location."""
        zone = self._zones.get(location_id, {})
        return zone.get("nearest_responders", [])

    def get_sop_tags(self, location_id: str) -> List[str]:
        """Return applicable SOP tags for a location."""
        zone = self._zones.get(location_id, {})
        return zone.get("sop_tags", [])

    def are_locations_adjacent(self, loc1: str, loc2: str) -> bool:
        """Check whether two locations are adjacent (within one hop)."""
        if loc1 == loc2:
            return True
        zone1 = self._zones.get(loc1, {})
        adjacent = zone1.get("adjacent_zones", [])
        return loc2 in adjacent

    def find_location_by_camera(self, camera_id: str) -> Optional[str]:
        """Find which zone a camera belongs to."""
        for zone_id, zone_data in self._zones.items():
            if camera_id in zone_data.get("cameras", []):
                return zone_id
        return None

    def get_terminal_for_location(self, location_id: str) -> Optional[str]:
        """Return terminal (T1/T2/T3/T4) for a location."""
        zone = self._zones.get(location_id, {})
        return zone.get("terminal")

    def get_zone_type(self, location_id: str) -> Optional[str]:
        """Return zone type: public, airside, or restricted."""
        zone = self._zones.get(location_id, {})
        return zone.get("zone")

    def list_all_locations(self) -> List[str]:
        """Return all known location IDs."""
        return list(self._zones.keys())

    def get_all_cameras(self) -> List[Dict]:
        """Return all cameras with their location context."""
        cameras = []
        for zone_id, zone_data in self._zones.items():
            for cam_id in zone_data.get("cameras", []):
                cameras.append({
                    "camera_id": cam_id,
                    "location_id": zone_id,
                    "terminal": zone_data.get("terminal"),
                    "zone": zone_data.get("zone"),
                    "location_name": zone_data.get("name"),
                })
        return cameras
