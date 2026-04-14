"""Tests for the RAG pipeline."""
import pytest
from unittest.mock import patch, MagicMock
from services.intelligence.rag import RAGPipeline, RetrievedDocument


class TestRAGChunking:
    def test_chunk_short_text(self):
        rag = RAGPipeline()
        chunks = rag._chunk_text("Hello world", chunk_size=500)
        assert len(chunks) == 1
        assert chunks[0] == "Hello world"

    def test_chunk_long_text(self):
        rag = RAGPipeline()
        words = ["word"] * 1100
        text = " ".join(words)
        chunks = rag._chunk_text(text, chunk_size=500, overlap=50)
        assert len(chunks) >= 2
        # Each chunk should be at most 500 words
        for chunk in chunks:
            assert len(chunk.split()) <= 500

    def test_chunk_empty_text(self):
        rag = RAGPipeline()
        chunks = rag._chunk_text("")
        assert chunks == []

    def test_chunk_overlap(self):
        rag = RAGPipeline()
        words = [f"word{i}" for i in range(600)]
        text = " ".join(words)
        chunks = rag._chunk_text(text, chunk_size=500, overlap=50)
        # Second chunk should start 450 words in (500 - 50 overlap)
        assert len(chunks) == 2


class TestRAGMockRetrieval:
    def test_mock_retrieve_returns_results(self):
        rag = RAGPipeline()
        rag._loaded = False
        results = rag.retrieve("unauthorized access at airside gate", top_k=3)
        assert len(results) >= 1
        assert all(isinstance(r, RetrievedDocument) for r in results)

    def test_mock_retrieve_access_query(self):
        rag = RAGPipeline()
        rag._loaded = False
        results = rag.retrieve("badge failure at gate airside access")
        assert results[0].doc_type == "sop"
        assert "unauthorized_access" in results[0].source

    def test_mock_retrieve_fire_query(self):
        rag = RAGPipeline()
        rag._loaded = False
        results = rag.retrieve("fire alarm smoke evacuation")
        assert "fire_evacuation" in results[0].source

    def test_mock_retrieve_medical_query(self):
        rag = RAGPipeline()
        rag._loaded = False
        results = rag.retrieve("person collapsed medical injury")
        assert "medical_emergency" in results[0].source

    def test_mock_retrieve_relevance_score(self):
        rag = RAGPipeline()
        rag._loaded = False
        results = rag.retrieve("test query")
        assert all(0.0 <= r.relevance_score <= 1.0 for r in results)
