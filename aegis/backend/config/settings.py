"""
Application settings loaded from environment variables.
Uses pydantic-settings for validation and type coercion.
"""
from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path

# Project root: two levels up from this file (backend/config/ → backend/ → aegis/)
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    # LLM
    LLM_PROVIDER: str = "groq"  # claude | openai | groq | ollama
    GROQ_API_KEY: Optional[str] = None
    CLAUDE_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: str = "http://localhost:11434/v1"
    OLLAMA_MODEL: str = "llama3.1:8b"
    CLAUDE_MODEL: str = "claude-sonnet-4-20250514"
    OPENAI_MODEL: str = "gpt-4o"
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # Database (SQLite for local dev, PostgreSQL for production)
    DATABASE_URL: str = "sqlite+aiosqlite:///./aegis_dev.db"
    REDIS_URL: str = ""  # Optional — leave empty to skip Redis

    # Auth
    JWT_SECRET: str = "change-this-to-a-random-64-char-string-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 60

    # AI Models
    ANOMALIB_MODEL: str = "efficient_ad"
    WHISPER_MODEL: str = "base"
    VIDEO_FPS: int = 2
    ANOMALY_THRESHOLD: float = 0.5

    # Voice
    TTS_ENGINE: str = "edge_tts"
    VOICE_AGENT_LANGUAGE: str = "en"
    TTS_VOICE_EDGE: str = "en-US-GuyNeural"
    TTS_VOICE_KOKORO: str = "af_heart"
    TTS_VOICE_SPEED: float = 1.0
    TTS_SAMPLE_RATE: int = 24000
    VOICE_URGENCY_THRESHOLD: float = 0.6  # score above which SOC alert is raised

    # Intelligence
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"  # comma-separated

    # Paths (resolved relative to project root at runtime if not overridden)
    DATA_DIR: str = str(_PROJECT_ROOT / "data")
    MODELS_DIR: str = str(_PROJECT_ROOT / "models")
    KNOWLEDGE_BASE_PATH: str = str(_PROJECT_ROOT / "data" / "knowledge_base")
    CHROMA_PATH: str = str(_PROJECT_ROOT / "data" / "chroma")
    FRAME_OUTPUT_PATH: str = str(_PROJECT_ROOT / "data" / "frames")
    AUDIO_OUTPUT_PATH: str = str(_PROJECT_ROOT / "data" / "audio")

    # Server
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
