"""
RAG (Retrieval-Augmented Generation) pipeline.

Uses sentence-transformers for embedding and ChromaDB for vector storage.
Retrieves relevant SOPs, regulations, and historical incidents for LLM context.
"""
import re
from dataclasses import dataclass, field
from typing import List, Optional
from config.settings import settings


@dataclass
class RetrievedDocument:
    content: str
    source: str
    doc_type: str
    relevance_score: float
    tags: List[str] = field(default_factory=list)


class RAGPipeline:
    def __init__(self):
        self.model = None
        self.collection = None
        self._loaded = False
        self._collection_name = "aegis_knowledge"

    def load(self):
        """Initialize sentence-transformers embedder and ChromaDB client."""
        try:
            from sentence_transformers import SentenceTransformer
            import chromadb

            self.model = SentenceTransformer(settings.EMBEDDING_MODEL)

            client = chromadb.PersistentClient(path=settings.CHROMA_PATH)
            self.collection = client.get_or_create_collection(
                name=self._collection_name,
                metadata={"hnsw:space": "cosine"},
            )
            self._loaded = True
            count = self.collection.count()
            print(f"RAG pipeline loaded. ChromaDB collection: {count} documents")
        except Exception as e:
            print(f"RAG pipeline load failed: {e}. Using mock retrieval.")
            self._loaded = False

    def index_document(self, content: str, source: str, doc_type: str, tags: List[str] = None):
        """Chunk, embed, and store a document in ChromaDB."""
        if not self._loaded:
            print(f"RAG not loaded — skipping indexing of {source}")
            return

        tags = tags or []
        chunks = self._chunk_text(content)

        for i, chunk in enumerate(chunks):
            doc_id = f"{source}_{i}"
            embedding = self.model.encode(chunk).tolist()

            self.collection.upsert(
                ids=[doc_id],
                embeddings=[embedding],
                documents=[chunk],
                metadatas=[{
                    "source": source,
                    "doc_type": doc_type,
                    "tags": ",".join(tags),
                    "chunk_index": i,
                }],
            )

    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        doc_type: Optional[str] = None,
    ) -> List[RetrievedDocument]:
        """Embed query and retrieve most relevant document chunks."""
        if not self._loaded:
            return self._mock_retrieve(query, top_k)

        embedding = self.model.encode(query).tolist()

        where = {"doc_type": doc_type} if doc_type else None

        results = self.collection.query(
            query_embeddings=[embedding],
            n_results=min(top_k, max(1, self.collection.count())),
            where=where,
            include=["documents", "metadatas", "distances"],
        )

        docs = []
        if results and results["documents"] and results["documents"][0]:
            for doc, meta, dist in zip(
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0],
            ):
                relevance = 1.0 - dist  # cosine distance → similarity
                tags = meta.get("tags", "").split(",") if meta.get("tags") else []
                docs.append(RetrievedDocument(
                    content=doc,
                    source=meta.get("source", "unknown"),
                    doc_type=meta.get("doc_type", "general"),
                    relevance_score=max(0.0, relevance),
                    tags=tags,
                ))

        docs.sort(key=lambda x: x.relevance_score, reverse=True)
        return docs

    def _chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """Split text into overlapping word-based chunks."""
        words = text.split()
        if not words:
            return []

        chunks = []
        start = 0
        while start < len(words):
            end = min(start + chunk_size, len(words))
            chunk = " ".join(words[start:end])
            chunks.append(chunk)
            if end >= len(words):
                break
            start += chunk_size - overlap

        return chunks

    def _mock_retrieve(self, query: str, top_k: int) -> List[RetrievedDocument]:
        """Return plausible mock documents when RAG is not loaded."""
        query_lower = query.lower()

        if any(w in query_lower for w in ["access", "gate", "badge", "airside"]):
            sop = "unauthorized_access"
        elif any(w in query_lower for w in ["fire", "smoke", "alarm", "evacuate"]):
            sop = "fire_evacuation"
        elif any(w in query_lower for w in ["medical", "collapsed", "injury", "pain"]):
            sop = "medical_emergency"
        elif any(w in query_lower for w in ["bomb", "explosive", "package", "suspicious"]):
            sop = "bomb_threat"
        elif any(w in query_lower for w in ["crowd", "surge", "density", "queue"]):
            sop = "crowd_management"
        elif any(w in query_lower for w in ["weapon", "armed", "threat", "attack"]):
            sop = "active_threat"
        elif any(w in query_lower for w in ["drone", "uav", "runway", "airspace"]):
            sop = "drone_intrusion"
        else:
            sop = "unauthorized_access"

        return [
            RetrievedDocument(
                content=f"[MOCK] Relevant SOP for {sop} — follow established procedures for this incident type. Dispatch nearest patrol unit and notify Terminal Duty Manager.",
                source=f"sops/{sop}.md",
                doc_type="sop",
                relevance_score=0.85,
                tags=[sop],
            )
        ]
