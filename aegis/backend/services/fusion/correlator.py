"""
Event correlator — groups raw events into clusters by time proximity and location adjacency.

Used for batch analysis of event streams. The FusionEngine handles real-time
streaming correlation; this module handles offline/historical correlation.
"""
from datetime import timedelta
from typing import List, Optional

from services.fusion.engine import RawEvent
from services.knowledge.graph import KnowledgeGraph


def correlate_events(
    events: List[RawEvent],
    time_window_seconds: int = 60,
    knowledge_graph: Optional[KnowledgeGraph] = None,
) -> List[List[RawEvent]]:
    """
    Group events into clusters where all events are:
    - Within time_window_seconds of the cluster's earliest event
    - In the same or adjacent location

    Returns list of clusters (each cluster is a list of RawEvent).
    """
    if not events:
        return []

    sorted_events = sorted(events, key=lambda e: e.timestamp)
    time_window = timedelta(seconds=time_window_seconds)
    clusters: List[List[RawEvent]] = []
    used = set()

    for i, anchor in enumerate(sorted_events):
        if i in used:
            continue

        cluster = [anchor]
        used.add(i)

        for j, candidate in enumerate(sorted_events):
            if j in used:
                continue
            if candidate.timestamp - anchor.timestamp > time_window:
                break  # events are sorted, no need to continue

            if _locations_related(anchor.location_id, candidate.location_id, knowledge_graph):
                cluster.append(candidate)
                used.add(j)

        clusters.append(cluster)

    return clusters


def _locations_related(
    loc1: str,
    loc2: str,
    knowledge_graph: Optional[KnowledgeGraph],
) -> bool:
    """Check if two locations are the same or adjacent."""
    if loc1 == loc2:
        return True
    if knowledge_graph:
        return knowledge_graph.are_locations_adjacent(loc1, loc2)
    return False
