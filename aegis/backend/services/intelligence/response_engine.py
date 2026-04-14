"""
Response recommendation engine.

Combines RAG retrieval with LLM generation to produce actionable
security recommendations for detected incidents.
"""
import json
import re
from typing import Optional

from services.fusion.engine import Incident
from services.intelligence.llm_client import LLMClient
from services.intelligence.prompts import RESPONSE_RECOMMENDATION_PROMPT
from services.intelligence.rag import RAGPipeline
from services.knowledge.graph import KnowledgeGraph


class ResponseEngine:
    def __init__(
        self,
        rag: RAGPipeline,
        llm: LLMClient,
        knowledge_graph: Optional[KnowledgeGraph] = None,
    ):
        self.rag = rag
        self.llm = llm
        self.knowledge_graph = knowledge_graph

    async def generate_response(self, incident: Incident) -> Incident:
        """
        Generate AI-powered recommendations for an incident.

        Retrieves relevant SOPs via RAG, fetches location context,
        calls LLM with structured prompt, updates incident fields.
        """
        query = self._build_query(incident)

        # Retrieve relevant SOPs
        sop_docs = self.rag.retrieve(query, top_k=5, doc_type="sop")
        sop_context = self._format_docs(sop_docs)

        # Retrieve similar past incidents
        history_docs = self.rag.retrieve(query, top_k=3, doc_type="history")
        history_context = self._format_docs(history_docs) if history_docs else "No similar incidents on record."

        # Build location context
        location_info = self._build_location_info(incident)

        # Serialize incident to JSON for prompt
        incident_json = self._serialize_incident(incident)

        prompt = RESPONSE_RECOMMENDATION_PROMPT.format(
            incident_json=incident_json,
            sop_context=sop_context,
            location_info=location_info,
            history_context=history_context,
        )

        response_text = await self.llm.chat(
            system_prompt="You are AEGIS, an expert airport security advisor. Respond only with valid JSON.",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=2000,
        )

        # Parse JSON response
        parsed = self._parse_json_response(response_text)

        # Update incident with LLM output
        if "explanation" in parsed:
            incident.explanation = parsed["explanation"]
        if "recommendations" in parsed:
            incident.recommendations = parsed["recommendations"]
        if "contacts" in parsed:
            incident.contacts = parsed["contacts"]

        return incident

    def _build_query(self, incident: Incident) -> str:
        """Build a retrieval query from incident event types."""
        event_types = list({e.event_type for e in incident.events})
        modalities = list(incident.modalities)
        location = incident.location_id

        parts = event_types + modalities
        if incident.severity_level >= 4:
            parts.append("critical security incident")

        return f"{location} {' '.join(parts)} security incident response"

    def _format_docs(self, docs) -> str:
        """Format retrieved documents into a context string."""
        if not docs:
            return "No relevant documents found."

        sections = []
        for i, doc in enumerate(docs, 1):
            sections.append(f"[{i}] Source: {doc.source} (relevance: {doc.relevance_score:.2f})\n{doc.content}")

        return "\n\n".join(sections)

    def _build_location_info(self, incident: Incident) -> str:
        """Build location context string from knowledge graph."""
        if not self.knowledge_graph:
            return f"Location: {incident.location_id}"

        zone = self.knowledge_graph.get_location(incident.location_id)
        if not zone:
            return f"Location: {incident.location_id}"

        cameras = self.knowledge_graph.get_cameras_for_location(incident.location_id)
        responders = self.knowledge_graph.get_nearest_responders(incident.location_id)

        responder_text = ", ".join(
            f"{r['unit']} ({r['eta_seconds']}s ETA)" for r in responders
        ) if responders else "Unknown"

        return (
            f"Location: {zone.get('name', incident.location_id)}\n"
            f"Terminal: {zone.get('terminal', 'Unknown')}\n"
            f"Zone type: {zone.get('zone', 'Unknown')}\n"
            f"Available cameras: {', '.join(cameras) if cameras else 'None'}\n"
            f"Nearest responders: {responder_text}"
        )

    def _serialize_incident(self, incident: Incident) -> str:
        """Serialize incident to JSON string for the prompt."""
        events_summary = []
        for e in incident.events:
            events_summary.append({
                "modality": e.modality,
                "event_type": e.event_type,
                "anomaly_score": round(e.anomaly_score, 3),
                "source_id": e.source_id,
                "timestamp": e.timestamp.isoformat(),
            })

        data = {
            "incident_id": incident.incident_id,
            "severity_level": incident.severity_level,
            "severity_score": round(incident.severity_score, 3),
            "confidence": incident.confidence,
            "location_id": incident.location_id,
            "terminal": incident.terminal,
            "modalities": list(incident.modalities),
            "events": events_summary,
            "status": incident.status,
        }
        return json.dumps(data, indent=2)

    def _parse_json_response(self, text: str) -> dict:
        """Parse LLM response, stripping markdown fences if present."""
        # Strip markdown code fences
        text = re.sub(r"```(?:json)?", "", text).strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Fallback: return text as explanation
            return {
                "explanation": text or "Unable to generate AI assessment. Follow standard SOPs.",
                "recommendations": [
                    {
                        "priority": 1,
                        "action": "Follow standard SOP for this incident type",
                        "reasoning": "AI assessment unavailable",
                        "who": "Duty Officer",
                    }
                ],
                "contacts": [],
            }
