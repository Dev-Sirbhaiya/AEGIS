"""Thin wrapper around RAGPipeline for knowledge base indexing."""
from services.intelligence.rag import RAGPipeline


class KnowledgeIndexer:
    def __init__(self, rag: RAGPipeline):
        self.rag = rag

    def index_document(self, content: str, source: str, doc_type: str, tags: list = None):
        """Index a single document into the RAG pipeline."""
        self.rag.index_document(content, source, doc_type, tags or [])

    def index_batch(self, documents: list):
        """Index multiple documents. Each item: {content, source, doc_type, tags}."""
        for doc in documents:
            self.index_document(
                content=doc["content"],
                source=doc["source"],
                doc_type=doc.get("doc_type", "general"),
                tags=doc.get("tags", []),
            )
