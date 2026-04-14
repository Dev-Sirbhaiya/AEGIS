"""
Knowledge base indexing script.

Run from the backend directory:
    cd aegis/backend && python ../scripts/index_knowledge.py

Indexes:
  - SOPs (data/knowledge_base/sops/*.md)
  - Regulations (data/knowledge_base/regulations/*.md)
  - Contacts (data/knowledge_base/contacts/*.json)
  - Locations (data/knowledge_base/locations/*.json)
"""
import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/backend")

from config.settings import settings
from services.intelligence.rag import RAGPipeline


def index_sops(rag: RAGPipeline, base_path: str):
    sop_dir = os.path.join(base_path, "sops")
    if not os.path.exists(sop_dir):
        print(f"SOP directory not found: {sop_dir}")
        return 0

    count = 0
    for filename in sorted(os.listdir(sop_dir)):
        if not filename.endswith(".md"):
            continue
        filepath = os.path.join(sop_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        sop_name = filename.replace(".md", "")
        rag.index_document(
            content=content,
            source=f"sops/{filename}",
            doc_type="sop",
            tags=[sop_name, "procedure", "response"],
        )
        print(f"  Indexed SOP: {filename}")
        count += 1

    return count


def index_regulations(rag: RAGPipeline, base_path: str):
    reg_dir = os.path.join(base_path, "regulations")
    if not os.path.exists(reg_dir):
        print(f"Regulations directory not found: {reg_dir}")
        return 0

    count = 0
    for filename in sorted(os.listdir(reg_dir)):
        if not filename.endswith(".md"):
            continue
        filepath = os.path.join(reg_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        rag.index_document(
            content=content,
            source=f"regulations/{filename}",
            doc_type="regulation",
            tags=["icao", "regulation", "compliance"],
        )
        print(f"  Indexed regulation: {filename}")
        count += 1

    return count


def index_contacts(rag: RAGPipeline, base_path: str):
    contacts_dir = os.path.join(base_path, "contacts")
    if not os.path.exists(contacts_dir):
        print(f"Contacts directory not found: {contacts_dir}")
        return 0

    count = 0
    for filename in sorted(os.listdir(contacts_dir)):
        if not filename.endswith(".json"):
            continue
        filepath = os.path.join(contacts_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Flatten JSON to readable text for embedding
        content = _flatten_json_to_text(data, title=filename.replace(".json", ""))

        rag.index_document(
            content=content,
            source=f"contacts/{filename}",
            doc_type="contacts",
            tags=["contacts", "emergency", "phone"],
        )
        print(f"  Indexed contacts: {filename}")
        count += 1

    return count


def index_locations(rag: RAGPipeline, base_path: str):
    loc_dir = os.path.join(base_path, "locations")
    if not os.path.exists(loc_dir):
        print(f"Locations directory not found: {loc_dir}")
        return 0

    count = 0
    for filename in sorted(os.listdir(loc_dir)):
        if not filename.endswith(".json"):
            continue
        filepath = os.path.join(loc_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        zones = data.get("zones", {})
        for zone_id, zone_data in zones.items():
            content = _zone_to_text(zone_id, zone_data)
            rag.index_document(
                content=content,
                source=f"locations/{filename}#{zone_id}",
                doc_type="location",
                tags=["location", zone_data.get("terminal", ""), zone_data.get("zone", "")],
            )
            count += 1
        print(f"  Indexed {len(zones)} zones from {filename}")

    return count


def _flatten_json_to_text(data: dict, title: str = "", indent: int = 0) -> str:
    """Recursively flatten JSON to readable key-value text."""
    lines = []
    if title:
        lines.append(f"# {title}")

    for key, value in data.items():
        prefix = "  " * indent
        if isinstance(value, dict):
            lines.append(f"{prefix}{key}:")
            lines.append(_flatten_json_to_text(value, indent=indent + 1))
        elif isinstance(value, list):
            lines.append(f"{prefix}{key}: {', '.join(str(v) for v in value)}")
        else:
            lines.append(f"{prefix}{key}: {value}")

    return "\n".join(lines)


def _zone_to_text(zone_id: str, zone: dict) -> str:
    """Convert zone JSON to readable text for embedding."""
    responders = zone.get("nearest_responders", [])
    responder_text = "; ".join(
        f"{r['unit']} at {r['location']} ({r['eta_seconds']}s ETA)"
        for r in responders
    )

    return (
        f"Zone: {zone_id}\n"
        f"Name: {zone.get('name', zone_id)}\n"
        f"Terminal: {zone.get('terminal', 'Unknown')}\n"
        f"Zone type: {zone.get('zone', 'Unknown')}\n"
        f"Description: {zone.get('description', '')}\n"
        f"Cameras: {', '.join(zone.get('cameras', []))}\n"
        f"Sensors: {', '.join(zone.get('sensors', []))}\n"
        f"Intercoms: {', '.join(zone.get('intercoms', []))}\n"
        f"Access points: {', '.join(zone.get('access_points', []))}\n"
        f"Nearest responders: {responder_text}\n"
        f"Applicable SOPs: {', '.join(zone.get('sop_tags', []))}\n"
        f"Adjacent zones: {', '.join(zone.get('adjacent_zones', []))}"
    )


def main():
    print("AEGIS Knowledge Base Indexer")
    print("=" * 40)

    rag = RAGPipeline()
    rag.load()

    if not rag._loaded:
        print("ERROR: RAG pipeline failed to load. Check ChromaDB and sentence-transformers installation.")
        sys.exit(1)

    base_path = settings.KNOWLEDGE_BASE_PATH
    print(f"\nIndexing from: {base_path}\n")

    total = 0

    print("Indexing SOPs...")
    total += index_sops(rag, base_path)

    print("\nIndexing regulations...")
    total += index_regulations(rag, base_path)

    print("\nIndexing contacts...")
    total += index_contacts(rag, base_path)

    print("\nIndexing locations...")
    total += index_locations(rag, base_path)

    print(f"\n{'=' * 40}")
    print(f"Total documents indexed: {total}")
    print(f"ChromaDB collection count: {rag.collection.count()}")
    print("Done.")


if __name__ == "__main__":
    main()
