"""Pytest fixtures for AEGIS backend tests."""
import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime


@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for the entire test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_llm():
    """Mock LLM client that returns predictable responses."""
    llm = AsyncMock()
    llm.chat = AsyncMock(return_value='{"explanation": "Test incident", "recommendations": [], "contacts": []}')
    return llm


@pytest.fixture
def mock_knowledge_graph():
    """Mock knowledge graph with T2_GATE_B4 data."""
    kg = MagicMock()
    kg.get_location.return_value = {
        "zone_id": "T2_GATE_B4",
        "name": "Terminal 2 Gate B4",
        "terminal": "T2",
        "zone": "airside",
        "cameras": ["CAM_T2_B4_01"],
        "sensors": [],
        "nearest_responders": [{"unit": "Patrol Alpha", "location": "T2 Post B", "eta_seconds": 90}],
        "sop_tags": ["unauthorized_access"],
        "adjacent_zones": ["T2_GATE_B3", "T2_GATE_B5"],
    }
    kg.are_locations_adjacent.return_value = False
    kg.get_cameras_for_location.return_value = ["CAM_T2_B4_01"]
    kg.get_nearest_responders.return_value = [{"unit": "Patrol Alpha", "eta_seconds": 90}]
    return kg


@pytest.fixture
def mock_rag():
    """Mock RAG pipeline."""
    from services.intelligence.rag import RetrievedDocument
    rag = MagicMock()
    rag.retrieve.return_value = [
        RetrievedDocument(
            content="Dispatch patrol officer immediately for unauthorized access.",
            source="sops/unauthorized_access.md",
            doc_type="sop",
            relevance_score=0.9,
            tags=["unauthorized_access"],
        )
    ]
    return rag
