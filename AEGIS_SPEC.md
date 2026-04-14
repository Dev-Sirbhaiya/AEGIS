# AEGIS — Claude Code Engineering Specification

## CRITICAL: READ THIS FIRST

This document is the **sole reference** for building AEGIS (Adaptive Engagement & Guided Intelligence for Security). It is written for Claude Code to consume. Every section contains exact commands, exact file contents, and exact build order. Do not deviate from the specifications unless the user explicitly requests changes.

**What is AEGIS?** A multimodal AI security response advisor for airport Security Operations Centres (SOCs). It ingests CCTV video, audio (distress calls, alarms), access control logs, and sensor data. It detects anomalies, explains situations in natural language, recommends proportionate responses, handles voice calls autonomously, trains officers via simulations, and generates predictive reports.

**Who is this for?** Certis Group's NAISC 2026 hackathon challenge. Certis runs security at Singapore Changi Airport (4,000 officers, 2,000+ CCTV cameras, 4 terminals). Their existing platform Mozart orchestrates workflows but does NOT explain anomalies, recommend responses, handle voice calls, train officers, or predict future threats. AEGIS fills those gaps and can work alongside Mozart or independently.

**Deployment target:** GitHub repository, runnable locally via Docker Compose. Heavy ML models can optionally run on Google Colab GPU.

---

## TABLE OF CONTENTS

1. [Build Order & Dependency Graph](#1-build-order--dependency-graph)
2. [Environment Setup](#2-environment-setup)
3. [Project Structure](#3-project-structure)
4. [Backend Implementation](#4-backend-implementation)
5. [AI/ML Module Implementations](#5-aiml-module-implementations)
6. [Multimodal Fusion Engine](#6-multimodal-fusion-engine)
7. [RAG & Knowledge System](#7-rag--knowledge-system)
8. [Voice Agent](#8-voice-agent)
9. [Response Recommendation Engine](#9-response-recommendation-engine)
10. [Training Simulation Engine](#10-training-simulation-engine)
11. [Reporting & Predictive Intelligence](#11-reporting--predictive-intelligence)
12. [Frontend Implementation](#12-frontend-implementation)
13. [Data Models & Database](#13-data-models--database)
14. [API Contracts](#14-api-contracts)
15. [WebSocket Events](#15-websocket-events)
16. [LLM Provider Abstraction](#16-llm-provider-abstraction)
17. [Knowledge Base Documents](#17-knowledge-base-documents)
18. [Simulation Scenarios](#18-simulation-scenarios)
19. [Demo Data & Demo Script](#19-demo-data--demo-script)
20. [Docker & Deployment](#20-docker--deployment)
21. [Error Handling & Fallbacks](#21-error-handling--fallbacks)
22. [Prompt Templates (Verbatim)](#22-prompt-templates-verbatim)
23. [Appendix: Certis & Domain Context](#23-appendix-certis--domain-context)

---

## 1. Build Order & Dependency Graph

**Build in this exact order. Each step depends on the previous ones.**

```
PHASE 1: SKELETON (build first, everything else depends on this)
  Step 1.1: Create project root, .env, docker-compose.yml
  Step 1.2: Create backend/ with FastAPI app, health check, CORS
  Step 1.3: Create frontend/ with React + Vite + Tailwind shell
  Step 1.4: Set up PostgreSQL models and migrations
  Step 1.5: Set up Redis connection
  Step 1.6: Set up WebSocket infrastructure (python-socketio)
  Step 1.7: Implement JWT authentication

PHASE 2: LLM BACKBONE (needed by nearly every smart feature)
  Step 2.1: Implement LLM provider abstraction (Section 16)
  Step 2.2: Test with at least one provider (Groq recommended — free, fast)

PHASE 3: AI MODULES (can be built in parallel, but listed in priority order)
  Step 3.1: Video anomaly detection (Anomalib) — Section 5.1
  Step 3.2: Audio classification (PANNs) — Section 5.2
  Step 3.3: Audio zero-shot (CLAP) — Section 5.3
  Step 3.4: Speech-to-text (Whisper) — Section 5.4
  Step 3.5: Text-to-speech (Kokoro or Edge TTS) — Section 5.5

PHASE 4: INTELLIGENCE
  Step 4.1: Knowledge base document creation — Section 17
  Step 4.2: RAG pipeline (embed, index, retrieve) — Section 7
  Step 4.3: Multimodal fusion engine — Section 6
  Step 4.4: Response recommendation engine — Section 9

PHASE 5: VOICE AGENT
  Step 5.1: Voice agent conversation manager — Section 8
  Step 5.2: Call handling and SOC handoff

PHASE 6: DASHBOARD
  Step 6.1: Split-screen layout — Section 12.1
  Step 6.2: Left panel (camera feeds, heatmaps, audio, timeline) — Section 12.2
  Step 6.3: Right panel (explanation, recommendations, contacts) — Section 12.3
  Step 6.4: Incident list with priority sorting — Section 12.4
  Step 6.5: Voice agent panel — Section 12.5
  Step 6.6: Action buttons and transfer — Section 12.6

PHASE 7: TRAINING & REPORTING
  Step 7.1: Simulation scenario loader — Section 10
  Step 7.2: Training mode UI — Section 10
  Step 7.3: Daily/monthly report generator — Section 11
  Step 7.4: Predictive heatmap — Section 11

PHASE 8: POLISH
  Step 8.1: Demo data package — Section 19
  Step 8.2: Docker Compose finalization — Section 20
  Step 8.3: README.md with setup instructions
```

---

## 2. Environment Setup

### 2.1 Required Tools

```bash
# These must be available on the system
node --version    # >= 18.0.0
npm --version     # >= 9.0.0
python3 --version # >= 3.10
pip3 --version
docker --version  # >= 24.0
docker compose version  # >= 2.20
```

### 2.2 Python Dependencies

Create `backend/requirements.txt` with these EXACT contents:

```
# Web framework
fastapi==0.115.6
uvicorn[standard]==0.34.0
python-multipart==0.0.18
python-socketio==5.12.1

# Database
sqlalchemy==2.0.36
asyncpg==0.30.0
alembic==1.14.1
psycopg2-binary==2.9.10

# Redis
redis==5.2.1

# Authentication
pyjwt==2.10.1
passlib[bcrypt]==1.7.4
python-jose[cryptography]==3.3.0

# AI/ML - Core
torch==2.5.1
torchvision==0.20.1
torchaudio==2.5.1

# AI/ML - Anomaly Detection
anomalib==1.2.0

# AI/ML - Audio
librosa==0.10.2.post1
soundfile==0.12.1

# AI/ML - Speech
openai-whisper==20240930
# Alternative (faster, use this if whisper is too slow):
# faster-whisper==1.1.0

# AI/ML - TTS
# kokoro is installed separately — see Section 5.5
edge-tts==6.1.20

# AI/ML - Embeddings & RAG
sentence-transformers==3.3.1
chromadb==0.5.23
langchain==0.3.14
langchain-community==0.3.14
langchain-text-splitters==0.3.4

# LLM Clients
anthropic==0.40.0
openai==1.58.1
groq==0.13.0

# Utilities
pydantic==2.10.4
pydantic-settings==2.7.1
python-dotenv==1.0.1
httpx==0.28.1
Pillow==11.1.0
numpy==1.26.4
pandas==2.2.3
aiofiles==24.1.0
```

### 2.3 Node Dependencies

Create `frontend/package.json`:

```json
{
  "name": "aegis-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "zustand": "^4.5.5",
    "socket.io-client": "^4.8.1",
    "axios": "^1.7.9",
    "recharts": "^2.15.0",
    "lucide-react": "^0.468.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.14",
    "@types/react-dom": "^18.3.2",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.2",
    "vite": "^6.0.5"
  }
}
```

### 2.4 Environment Variables

Create `.env.example` at project root with these EXACT contents:

```bash
# ============================================================
# AEGIS Configuration
# Copy this file to .env and fill in your values
# ============================================================

# --- LLM PROVIDER (choose ONE, set its API key) ---
# Options: claude | openai | groq | ollama
LLM_PROVIDER=groq

# Provider API Keys (set the one matching LLM_PROVIDER)
GROQ_API_KEY=
CLAUDE_API_KEY=
OPENAI_API_KEY=

# For Ollama (local LLM): set this to your Ollama server URL
OLLAMA_BASE_URL=http://localhost:11434/v1
# Ollama model to use (e.g., llama3.1:8b, mistral:7b)
OLLAMA_MODEL=llama3.1:8b

# --- LLM Model Selection ---
# These are the default models per provider. Override if needed.
CLAUDE_MODEL=claude-sonnet-4-20250514
OPENAI_MODEL=gpt-4o
GROQ_MODEL=llama-3.3-70b-versatile

# --- DATABASE ---
POSTGRES_DB=aegis
POSTGRES_USER=aegis
POSTGRES_PASSWORD=aegis_dev_password
DATABASE_URL=postgresql+asyncpg://aegis:aegis_dev_password@localhost:5432/aegis

# --- REDIS ---
REDIS_URL=redis://localhost:6379/0

# --- AUTHENTICATION ---
JWT_SECRET=change-this-to-a-random-64-char-string-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRY_MINUTES=60

# --- AI MODEL SETTINGS ---
# Anomalib model: efficient_ad | patchcore | padim | stfpm
ANOMALIB_MODEL=efficient_ad
# Whisper model size: tiny | base | small | medium | large-v3
WHISPER_MODEL=base
# Video processing: frames per second to analyze
VIDEO_FPS=2
# Anomaly score threshold (0.0 to 1.0). Events above this trigger alerts.
ANOMALY_THRESHOLD=0.5

# --- VOICE AGENT ---
# TTS engine: kokoro | edge_tts
TTS_ENGINE=edge_tts
# Default language for voice agent
VOICE_AGENT_LANGUAGE=en

# --- PATHS (relative to project root) ---
DATA_DIR=./data
MODELS_DIR=./models

# --- SERVER ---
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
FRONTEND_PORT=3000
```

---

## 3. Project Structure

**Create this exact folder structure. Every folder listed here must exist. Every file listed here must be created.**

```bash
# Run these commands from the project root to create the structure:

mkdir -p aegis/{backend/{config,api/{routes,websocket,middleware},models,services/{video,audio,fusion,intelligence,voice,simulation,reporting,knowledge},db/migrations,tests},frontend/{public,src/{components/{layout,panels,intelligence,voice,simulation,reports,shared},hooks,stores,services,types,utils}},data/{knowledge_base/{sops,contacts,regulations,locations},simulations/{scenarios,frames,audio,logs},demo,chroma},models/{anomalib,panns,clap,whisper},notebooks,scripts,docs}
```

File manifest (every file that must be created):

```
aegis/
├── README.md
├── PRD.md                              # THIS FILE
├── docker-compose.yml
├── .env.example
├── .env                                # User creates from .env.example
├── .gitignore
├── Makefile
│
├── backend/
│   ├── main.py                         # FastAPI entry point
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py                 # Pydantic settings from .env
│   │   ├── llm_config.py              # LLM provider factory
│   │   └── logging_config.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── incidents.py
│   │   │   ├── cameras.py
│   │   │   ├── voice.py
│   │   │   ├── simulation.py
│   │   │   ├── reports.py
│   │   │   ├── auth.py
│   │   │   └── health.py
│   │   ├── websocket/
│   │   │   ├── __init__.py
│   │   │   ├── events.py
│   │   │   └── manager.py
│   │   └── middleware/
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       └── cors.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── incident.py
│   │   ├── event.py
│   │   ├── user.py
│   │   ├── report.py
│   │   └── simulation.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── video/
│   │   │   ├── __init__.py
│   │   │   ├── anomaly_detector.py     # Anomalib wrapper
│   │   │   ├── frame_extractor.py
│   │   │   └── heatmap_generator.py
│   │   ├── audio/
│   │   │   ├── __init__.py
│   │   │   ├── panns_classifier.py     # PANNs wrapper
│   │   │   ├── clap_classifier.py      # CLAP wrapper
│   │   │   ├── whisper_stt.py          # Whisper wrapper
│   │   │   └── audio_processor.py
│   │   ├── fusion/
│   │   │   ├── __init__.py
│   │   │   ├── engine.py               # Main fusion logic
│   │   │   ├── severity.py             # Severity scoring rules
│   │   │   └── correlator.py           # Time/space correlation
│   │   ├── intelligence/
│   │   │   ├── __init__.py
│   │   │   ├── rag.py                  # RAG retrieve + prompt
│   │   │   ├── llm_client.py           # LLM provider abstraction
│   │   │   ├── response_engine.py      # Generate ranked responses
│   │   │   └── prompts.py              # ALL prompt templates
│   │   ├── voice/
│   │   │   ├── __init__.py
│   │   │   ├── agent.py                # Conversation manager
│   │   │   ├── tts.py                  # TTS wrapper
│   │   │   └── call_manager.py         # Queue + handoff
│   │   ├── simulation/
│   │   │   ├── __init__.py
│   │   │   ├── generator.py            # Synthetic event generator
│   │   │   ├── evaluator.py            # Scoring engine
│   │   │   └── scenario_loader.py
│   │   ├── reporting/
│   │   │   ├── __init__.py
│   │   │   ├── daily_report.py
│   │   │   ├── monthly_report.py
│   │   │   └── predictive.py
│   │   └── knowledge/
│   │       ├── __init__.py
│   │       ├── graph.py                # Location knowledge graph
│   │       └── indexer.py              # Document embedding
│   ├── db/
│   │   ├── __init__.py
│   │   ├── session.py
│   │   └── migrations/
│   └── tests/
│       ├── __init__.py
│       ├── test_fusion.py
│       ├── test_rag.py
│       └── conftest.py
│
├── frontend/
│   ├── package.json
│   ├── Dockerfile
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── index.html
│   ├── public/
│   │   └── aegis_logo.svg
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css                   # Tailwind imports
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Dashboard.tsx        # Main split-screen
│       │   │   ├── Navbar.tsx
│       │   │   └── StatusBar.tsx
│       │   ├── panels/
│       │   │   ├── LeftPanel.tsx
│       │   │   ├── RightPanel.tsx
│       │   │   ├── CameraFeed.tsx
│       │   │   ├── HeatmapView.tsx
│       │   │   ├── AudioWaveform.tsx
│       │   │   ├── SensorTimeline.tsx
│       │   │   └── IncidentList.tsx
│       │   ├── intelligence/
│       │   │   ├── SituationCard.tsx
│       │   │   ├── ActionList.tsx
│       │   │   ├── ContactCard.tsx
│       │   │   └── HistoryPanel.tsx
│       │   ├── voice/
│       │   │   ├── VoiceStatus.tsx
│       │   │   ├── Transcription.tsx
│       │   │   └── CallControls.tsx
│       │   ├── simulation/
│       │   │   ├── SimDashboard.tsx
│       │   │   ├── ScenarioSelect.tsx
│       │   │   ├── ScoreCard.tsx
│       │   │   └── Debrief.tsx
│       │   ├── reports/
│       │   │   ├── DailyReport.tsx
│       │   │   ├── MonthlyReport.tsx
│       │   │   └── PredictiveMap.tsx
│       │   └── shared/
│       │       ├── SeverityBadge.tsx
│       │       ├── LoadingSpinner.tsx
│       │       └── Modal.tsx
│       ├── hooks/
│       │   ├── useWebSocket.ts
│       │   ├── useIncidents.ts
│       │   └── useAuth.ts
│       ├── stores/
│       │   ├── incidentStore.ts
│       │   ├── cameraStore.ts
│       │   └── authStore.ts
│       ├── services/
│       │   ├── api.ts
│       │   └── socket.ts
│       ├── types/
│       │   ├── incident.ts
│       │   ├── event.ts
│       │   └── simulation.ts
│       └── utils/
│           ├── severity.ts
│           └── formatters.ts
│
├── data/
│   ├── knowledge_base/
│   │   ├── sops/
│   │   │   ├── unauthorized_access.md
│   │   │   ├── medical_emergency.md
│   │   │   ├── bomb_threat.md
│   │   │   ├── fire_evacuation.md
│   │   │   ├── active_threat.md
│   │   │   ├── unattended_baggage.md
│   │   │   ├── crowd_management.md
│   │   │   ├── lift_breakdown.md
│   │   │   ├── aggressive_behavior.md
│   │   │   └── drone_intrusion.md
│   │   ├── contacts/
│   │   │   └── changi_contacts.json
│   │   ├── regulations/
│   │   │   └── icao_sarps_summary.md
│   │   └── locations/
│   │       └── changi_zones.json
│   ├── simulations/
│   │   └── scenarios/
│   │       ├── SIM_001_unauthorized_access.json
│   │       ├── SIM_002_unattended_baggage.json
│   │       ├── SIM_003_medical_emergency.json
│   │       ├── SIM_004_lift_breakdown.json
│   │       ├── SIM_005_aggressive_passenger.json
│   │       ├── SIM_006_fire_alarm.json
│   │       ├── SIM_007_suspicious_package.json
│   │       ├── SIM_008_crowd_surge.json
│   │       ├── SIM_009_drone_intrusion.json
│   │       └── SIM_010_child_separated.json
│   └── demo/
│       └── .gitkeep
│
├── models/
│   └── .gitkeep
│
├── notebooks/
│   ├── 01_anomalib_demo.ipynb
│   ├── 02_panns_demo.ipynb
│   ├── 03_rag_demo.ipynb
│   └── 04_full_pipeline.ipynb
│
├── scripts/
│   ├── setup.sh
│   ├── seed_db.py
│   ├── index_knowledge.py
│   └── download_models.py
│
└── docs/
    ├── ARCHITECTURE.md
    └── DEMO_GUIDE.md
```

---

## 4. Backend Implementation

### 4.1 FastAPI Entry Point

**File: `backend/main.py`**

```python
"""
AEGIS Backend — FastAPI Application Entry Point

This is the main entry point. It:
1. Creates the FastAPI app with CORS
2. Mounts all API routers
3. Initializes Socket.IO for real-time events
4. Connects to PostgreSQL and Redis on startup
5. Loads AI models on startup (lazy loading for heavy models)
"""
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config.settings import settings
from db.session import init_db
from api.routes import incidents, cameras, voice, simulation, reports, auth, health
from api.websocket.manager import sio

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup
    await init_db()
    print("✅ Database initialized")
    print(f"✅ LLM Provider: {settings.LLM_PROVIDER}")
    print(f"✅ Anomaly model: {settings.ANOMALIB_MODEL}")
    print(f"✅ Whisper model: {settings.WHISPER_MODEL}")
    yield
    # Shutdown
    print("🛑 Shutting down AEGIS")

app = FastAPI(
    title="AEGIS API",
    description="Adaptive Engagement & Guided Intelligence for Security",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(incidents.router, prefix="/api/incidents", tags=["Incidents"])
app.include_router(cameras.router, prefix="/api/cameras", tags=["Cameras"])
app.include_router(voice.router, prefix="/api/voice", tags=["Voice Agent"])
app.include_router(simulation.router, prefix="/api/simulation", tags=["Simulation"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

# Mount Socket.IO
socket_app = socketio.ASGIApp(sio, other_app=app)

# To run: uvicorn main:socket_app --host 0.0.0.0 --port 8000 --reload
```

### 4.2 Settings

**File: `backend/config/settings.py`**

```python
"""
Application settings loaded from environment variables.
Uses pydantic-settings for validation and type coercion.
"""
from pydantic_settings import BaseSettings
from typing import Optional

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

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://aegis:aegis_dev_password@localhost:5432/aegis"
    REDIS_URL: str = "redis://localhost:6379/0"

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

    # Paths
    DATA_DIR: str = "./data"
    MODELS_DIR: str = "./models"

    # Server
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
```

### 4.3 Database Session

**File: `backend/db/session.py`**

```python
"""Database session management using SQLAlchemy async."""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from config.settings import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def init_db():
    """Create all tables. In production, use Alembic migrations instead."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    """Dependency injection for FastAPI routes."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

### 4.4 WebSocket Manager

**File: `backend/api/websocket/manager.py`**

```python
"""Socket.IO server for real-time event broadcasting."""
import socketio

# Create Socket.IO server (async mode for FastAPI)
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)

@sio.event
async def connect(sid, environ):
    print(f"🔌 Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"🔌 Client disconnected: {sid}")

@sio.event
async def subscribe_incidents(sid, data):
    """Client subscribes to incident updates."""
    await sio.enter_room(sid, "incidents")

@sio.event
async def subscribe_voice(sid, data):
    """Client subscribes to voice agent updates."""
    await sio.enter_room(sid, "voice")

# Helper functions for broadcasting events
async def emit_new_incident(incident_data: dict):
    """Broadcast new incident to all subscribers."""
    await sio.emit("incident:new", incident_data, room="incidents")

async def emit_incident_update(incident_data: dict):
    """Broadcast incident update."""
    await sio.emit("incident:update", incident_data, room="incidents")

async def emit_voice_event(event_type: str, data: dict):
    """Broadcast voice agent event."""
    await sio.emit(f"voice:{event_type}", data, room="voice")
```

---

## 5. AI/ML Module Implementations

### 5.1 Video Anomaly Detection (Anomalib)

**File: `backend/services/video/anomaly_detector.py`**

**How Anomalib works:** It is trained on "normal" images only. At inference, it scores each image on how different it is from normal. High score = anomaly. It also produces a pixel-level heatmap showing WHERE the anomaly is.

**For the hackathon:** Use a pretrained model (EfficientAD on MVTec AD dataset). For custom training, see the notebook `01_anomalib_demo.ipynb`.

```python
"""
Video anomaly detection using Anomalib.

Usage:
    detector = VideoAnomalyDetector()
    result = detector.detect(frame)  # numpy array (H, W, 3) BGR
    # result.anomaly_score: float 0.0-1.0
    # result.heatmap: numpy array (H, W, 3) — heatmap overlay
    # result.is_anomalous: bool — whether score exceeds threshold
"""
import numpy as np
from pathlib import Path
from PIL import Image
from typing import Optional
from dataclasses import dataclass
from config.settings import settings

@dataclass
class DetectionResult:
    anomaly_score: float          # 0.0 to 1.0
    is_anomalous: bool            # True if score > threshold
    heatmap: Optional[np.ndarray] # Pixel-level anomaly heatmap (H, W, 3)
    frame: np.ndarray             # Original frame
    bbox: Optional[list]          # [x1, y1, x2, y2] of anomalous region, or None

class VideoAnomalyDetector:
    """
    Wraps Anomalib for video frame anomaly detection.
    
    Model options (set via ANOMALIB_MODEL env var):
    - efficient_ad: Fast, good accuracy, low memory. Best for real-time.
    - patchcore: Slower, best accuracy, high memory. Best for high-security.
    - padim: Balanced speed/accuracy.
    - stfpm: Good for texture-heavy scenes.
    """
    
    def __init__(self):
        self.model = None
        self.threshold = settings.ANOMALY_THRESHOLD
        self.model_name = settings.ANOMALIB_MODEL
        self._loaded = False
    
    def load(self):
        """
        Load the Anomalib model. Call this once at startup.
        
        IMPORTANT: Anomalib models need to be trained first on normal data.
        For hackathon demo, we use one of these approaches:
        1. Pre-trained checkpoint (if available in models/anomalib/)
        2. Train on a small set of normal frames (see notebook)
        3. Fall back to a simple threshold-based mock for demo
        """
        try:
            from anomalib.deploy import OpenVINOInferencer
            # Try to load a pre-exported OpenVINO model for fast inference
            model_path = Path(settings.MODELS_DIR) / "anomalib" / "model.onnx"
            if model_path.exists():
                self.model = OpenVINOInferencer(
                    path=model_path,
                    device="CPU",
                )
                self._loaded = True
                print(f"✅ Anomalib model loaded: {self.model_name} (OpenVINO)")
                return
        except ImportError:
            pass
        
        try:
            from anomalib.engine import Engine
            from anomalib.models import EfficientAd, Patchcore, Padim
            
            model_map = {
                "efficient_ad": EfficientAd,
                "patchcore": Patchcore,
                "padim": Padim,
            }
            
            ModelClass = model_map.get(self.model_name, EfficientAd)
            
            # Check for saved checkpoint
            ckpt_path = Path(settings.MODELS_DIR) / "anomalib" / "model.ckpt"
            if ckpt_path.exists():
                self.model = ModelClass.load_from_checkpoint(str(ckpt_path))
                self._loaded = True
                print(f"✅ Anomalib model loaded: {self.model_name} (checkpoint)")
                return
            
            print(f"⚠️ No pre-trained Anomalib model found. Using mock detector.")
            print(f"   To train: run notebooks/01_anomalib_demo.ipynb")
            self._loaded = False
            
        except Exception as e:
            print(f"⚠️ Anomalib load failed: {e}. Using mock detector.")
            self._loaded = False
    
    def detect(self, frame: np.ndarray) -> DetectionResult:
        """
        Detect anomalies in a single frame.
        
        Args:
            frame: numpy array (H, W, 3) in BGR format (OpenCV default)
        
        Returns:
            DetectionResult with anomaly_score, heatmap, etc.
        """
        if self._loaded and self.model is not None:
            return self._detect_real(frame)
        else:
            return self._detect_mock(frame)
    
    def _detect_real(self, frame: np.ndarray) -> DetectionResult:
        """Real detection using loaded Anomalib model."""
        import cv2
        # Resize to model input size
        resized = cv2.resize(frame, (256, 256))
        img = Image.fromarray(cv2.cvtColor(resized, cv2.COLOR_BGR2RGB))
        
        # Run inference
        predictions = self.model.predict(img)
        
        score = float(predictions.pred_score)
        heatmap = np.array(predictions.anomaly_map) if hasattr(predictions, 'anomaly_map') else None
        
        # Find bounding box of anomalous region (if heatmap available)
        bbox = None
        if heatmap is not None:
            binary = (heatmap > 0.5).astype(np.uint8) * 255
            if len(binary.shape) == 3:
                binary = binary[:, :, 0]
            contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if contours:
                largest = max(contours, key=cv2.contourArea)
                x, y, w, h = cv2.boundingRect(largest)
                # Scale back to original frame size
                scale_x = frame.shape[1] / 256
                scale_y = frame.shape[0] / 256
                bbox = [int(x * scale_x), int(y * scale_y),
                        int((x + w) * scale_x), int((y + h) * scale_y)]
        
        return DetectionResult(
            anomaly_score=score,
            is_anomalous=score > self.threshold,
            heatmap=heatmap,
            frame=frame,
            bbox=bbox,
        )
    
    def _detect_mock(self, frame: np.ndarray) -> DetectionResult:
        """
        Mock detector for demo when no trained model is available.
        Uses simple heuristics (brightness variance, edge density) to
        generate a plausible anomaly score. This is NOT real anomaly
        detection — it's a placeholder for demo purposes.
        """
        import cv2
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Simple heuristic: high variance in brightness = potential anomaly
        variance = np.var(gray) / 10000.0
        edges = cv2.Canny(gray, 100, 200)
        edge_density = np.sum(edges > 0) / edges.size
        
        # Combine heuristics into a mock score (0-1)
        mock_score = min((variance * 0.3 + edge_density * 0.7), 1.0)
        
        # Generate a simple heatmap based on edge density per region
        h, w = gray.shape
        heatmap = np.zeros((h, w, 3), dtype=np.uint8)
        block_h, block_w = h // 8, w // 8
        for i in range(8):
            for j in range(8):
                block = edges[i*block_h:(i+1)*block_h, j*block_w:(j+1)*block_w]
                intensity = int(np.sum(block > 0) / block.size * 255)
                heatmap[i*block_h:(i+1)*block_h, j*block_w:(j+1)*block_w] = [0, 0, intensity]
        
        return DetectionResult(
            anomaly_score=mock_score,
            is_anomalous=mock_score > self.threshold,
            heatmap=heatmap,
            frame=frame,
            bbox=None,
        )
```

### 5.2 Audio Classification (PANNs)

**File: `backend/services/audio/panns_classifier.py`**

**How PANNs works:** Pre-trained on AudioSet (5,800 hours, 527 sound classes). Feed it an audio clip, get back probabilities for all 527 classes. We filter to security-relevant classes.

```python
"""
Audio event classification using PANNs (Cnn14).

Detects 527 sound classes from AudioSet. We filter to security-relevant ones:
- Scream, Shout, Yell
- Gunshot, Explosion
- Glass breaking, Shattering
- Alarm, Siren, Fire alarm, Smoke detector
- Crying, Sobbing
- Running (footsteps)
- Crowd noise
- Dog barking (security K-9)
- Vehicle (horn, engine, crash)
- Speech

Usage:
    classifier = PANNsClassifier()
    classifier.load()
    results = classifier.classify("path/to/audio.wav")
"""
import numpy as np
from pathlib import Path
from typing import List, Dict, Optional
from dataclasses import dataclass
from config.settings import settings

# Security-relevant AudioSet class indices and labels
# Full list: https://github.com/qiuqiangkong/audioset_tagging_cnn
SECURITY_LABELS = {
    0: "Speech",
    1: "Male speech",
    2: "Female speech",
    19: "Shout",
    20: "Scream",
    21: "Yell",
    22: "Children shouting",
    24: "Crying",
    25: "Sobbing",
    72: "Alarm",
    73: "Alarm clock",
    77: "Siren",
    78: "Civil defense siren",
    79: "Fire alarm",
    80: "Smoke detector",
    288: "Gunshot",
    289: "Machine gun",
    399: "Glass",
    400: "Shattering",
    427: "Explosion",
    428: "Boom",
    307: "Dog",
    308: "Dog bark",
    134: "Run",
    135: "Walk, footsteps",
    367: "Crash",
    340: "Vehicle horn",
}

@dataclass
class AudioClassification:
    label: str
    confidence: float
    class_index: int

class PANNsClassifier:
    def __init__(self):
        self.model = None
        self._loaded = False
    
    def load(self):
        """Load PANNs Cnn14 model. Downloads weights if not present."""
        try:
            import torch
            import torchvision
            
            # Try to import panns_inference (pip install panns-inference)
            try:
                from panns_inference import AudioTagging
                self.model = AudioTagging(
                    checkpoint_path=None,  # Auto-downloads Cnn14
                    device="cuda" if torch.cuda.is_available() else "cpu"
                )
                self._loaded = True
                print("✅ PANNs model loaded (panns_inference)")
                return
            except ImportError:
                pass
            
            # Fallback: manual loading
            print("⚠️ panns_inference not installed. Install with: pip install panns-inference")
            print("   Using mock audio classifier for demo.")
            self._loaded = False
            
        except Exception as e:
            print(f"⚠️ PANNs load failed: {e}. Using mock classifier.")
            self._loaded = False
    
    def classify(self, audio_path: str, top_k: int = 5) -> List[AudioClassification]:
        """
        Classify audio file. Returns top_k security-relevant labels.
        
        Args:
            audio_path: Path to audio file (WAV, MP3, etc.)
            top_k: Number of top predictions to return
        
        Returns:
            List of AudioClassification sorted by confidence (descending)
        """
        if self._loaded and self.model is not None:
            return self._classify_real(audio_path, top_k)
        else:
            return self._classify_mock(audio_path, top_k)
    
    def _classify_real(self, audio_path: str, top_k: int) -> List[AudioClassification]:
        """Real classification using PANNs."""
        import librosa
        
        # Load audio at 32kHz (PANNs requirement)
        audio, sr = librosa.load(audio_path, sr=32000, mono=True)
        
        # Ensure minimum length (1 second)
        if len(audio) < 32000:
            audio = np.pad(audio, (0, 32000 - len(audio)))
        
        # Run inference
        clipwise_output, _ = self.model.inference(audio[np.newaxis, :])
        probs = clipwise_output[0]
        
        # Filter to security-relevant labels
        results = []
        for idx, label in SECURITY_LABELS.items():
            if idx < len(probs):
                results.append(AudioClassification(
                    label=label,
                    confidence=float(probs[idx]),
                    class_index=idx,
                ))
        
        # Sort by confidence and return top_k
        results.sort(key=lambda x: x.confidence, reverse=True)
        return results[:top_k]
    
    def _classify_mock(self, audio_path: str, top_k: int) -> List[AudioClassification]:
        """Mock classifier for demo."""
        # Return plausible labels based on filename heuristics
        path_lower = audio_path.lower()
        
        if "distress" in path_lower or "help" in path_lower:
            return [
                AudioClassification("Scream", 0.85, 20),
                AudioClassification("Speech", 0.78, 0),
                AudioClassification("Crying", 0.45, 24),
            ][:top_k]
        elif "alarm" in path_lower:
            return [
                AudioClassification("Fire alarm", 0.92, 79),
                AudioClassification("Siren", 0.67, 77),
                AudioClassification("Alarm", 0.55, 72),
            ][:top_k]
        else:
            return [
                AudioClassification("Speech", 0.72, 0),
                AudioClassification("Walk, footsteps", 0.35, 135),
            ][:top_k]
```

### 5.3 Audio Zero-Shot (CLAP)

**File: `backend/services/audio/clap_classifier.py`**

```python
"""
Zero-shot audio classification using CLAP.

Unlike PANNs (fixed 527 classes), CLAP can classify audio against
ANY text description. This is powerful for security because we can
query: "Is this a distress call?" "Is someone being attacked?"
without needing training data for those specific categories.

Usage:
    clap = CLAPClassifier()
    clap.load()
    score = clap.query("path/to/audio.wav", "someone screaming for help")
"""
import numpy as np
from typing import List, Tuple, Optional
from config.settings import settings

# Default security-relevant queries
DEFAULT_SECURITY_QUERIES = [
    "distress call for help",
    "physical altercation or fight",
    "gunshot or explosion",
    "glass breaking or shattering",
    "fire alarm or smoke alarm",
    "crowd panic or stampede",
    "person crying or sobbing in distress",
    "unauthorized alarm or intrusion alert",
    "vehicle crash or collision",
    "normal ambient noise",
]

class CLAPClassifier:
    def __init__(self):
        self.model = None
        self.processor = None
        self._loaded = False
    
    def load(self):
        """Load CLAP model from HuggingFace."""
        try:
            from transformers import ClapModel, ClapProcessor
            import torch
            
            model_name = "laion/clap-htsat-unfused"
            self.processor = ClapProcessor.from_pretrained(model_name)
            self.model = ClapModel.from_pretrained(model_name)
            self.model.eval()
            
            if torch.cuda.is_available():
                self.model = self.model.cuda()
            
            self._loaded = True
            print("✅ CLAP model loaded")
        except Exception as e:
            print(f"⚠️ CLAP load failed: {e}. Using mock.")
            self._loaded = False
    
    def query(self, audio_path: str, text_query: str) -> float:
        """
        Score how well an audio clip matches a text description.
        
        Returns: float 0.0 to 1.0 (similarity score)
        """
        if self._loaded:
            return self._query_real(audio_path, text_query)
        return 0.5  # Mock: neutral score
    
    def classify_against_queries(
        self, audio_path: str, queries: List[str] = None
    ) -> List[Tuple[str, float]]:
        """
        Classify audio against multiple text queries.
        
        Returns: List of (query, score) sorted by score descending
        """
        if queries is None:
            queries = DEFAULT_SECURITY_QUERIES
        
        results = [(q, self.query(audio_path, q)) for q in queries]
        results.sort(key=lambda x: x[1], reverse=True)
        return results
    
    def _query_real(self, audio_path: str, text_query: str) -> float:
        """Real CLAP inference."""
        import librosa
        import torch
        
        audio, sr = librosa.load(audio_path, sr=48000, mono=True)
        
        inputs = self.processor(
            text=[text_query],
            audios=[audio],
            sampling_rate=48000,
            return_tensors="pt",
            padding=True,
        )
        
        if torch.cuda.is_available():
            inputs = {k: v.cuda() for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = self.model(**inputs)
        
        # Cosine similarity between audio and text embeddings
        similarity = torch.nn.functional.cosine_similarity(
            outputs.text_embeds, outputs.audio_embeds
        )
        
        # Convert from [-1, 1] to [0, 1]
        score = (similarity.item() + 1) / 2
        return score
```

### 5.4 Speech-to-Text (Whisper)

**File: `backend/services/audio/whisper_stt.py`**

```python
"""
Speech-to-text using OpenAI Whisper.

Usage:
    stt = WhisperSTT()
    stt.load()
    result = stt.transcribe("path/to/audio.wav")
    # result.text: str
    # result.language: str
    # result.segments: list of timed segments
"""
from dataclasses import dataclass, field
from typing import List, Optional
from config.settings import settings

@dataclass
class TranscriptionSegment:
    start: float      # seconds
    end: float        # seconds
    text: str

@dataclass
class TranscriptionResult:
    text: str                               # Full transcription
    language: str                           # Detected language code
    segments: List[TranscriptionSegment]    # Timed segments
    duration: float                         # Audio duration in seconds

class WhisperSTT:
    def __init__(self):
        self.model = None
        self._loaded = False
        self.model_size = settings.WHISPER_MODEL  # tiny|base|small|medium|large-v3
    
    def load(self):
        """Load Whisper model."""
        try:
            import whisper
            self.model = whisper.load_model(self.model_size)
            self._loaded = True
            print(f"✅ Whisper model loaded: {self.model_size}")
        except Exception as e:
            print(f"⚠️ Whisper load failed: {e}. Using mock STT.")
            self._loaded = False
    
    def transcribe(self, audio_path: str, language: str = None) -> TranscriptionResult:
        """
        Transcribe audio file to text.
        
        Args:
            audio_path: Path to audio file
            language: Force language (None = auto-detect)
        
        Returns:
            TranscriptionResult with full text and segments
        """
        if self._loaded and self.model is not None:
            return self._transcribe_real(audio_path, language)
        return self._transcribe_mock(audio_path)
    
    def _transcribe_real(self, audio_path: str, language: str = None) -> TranscriptionResult:
        """Real Whisper transcription."""
        options = {"task": "transcribe"}
        if language:
            options["language"] = language
        
        result = self.model.transcribe(audio_path, **options)
        
        segments = [
            TranscriptionSegment(
                start=seg["start"],
                end=seg["end"],
                text=seg["text"].strip(),
            )
            for seg in result.get("segments", [])
        ]
        
        return TranscriptionResult(
            text=result["text"].strip(),
            language=result.get("language", "en"),
            segments=segments,
            duration=segments[-1].end if segments else 0.0,
        )
    
    def _transcribe_mock(self, audio_path: str) -> TranscriptionResult:
        """Mock transcription for demo."""
        path_lower = audio_path.lower()
        if "distress" in path_lower:
            text = "Help! Someone collapsed near Gate B4! Please send help immediately!"
        elif "alarm" in path_lower:
            text = "[Alarm sound detected - no speech content]"
        else:
            text = "This is a test audio recording for the AEGIS system."
        
        return TranscriptionResult(
            text=text,
            language="en",
            segments=[TranscriptionSegment(0.0, 5.0, text)],
            duration=5.0,
        )
```

### 5.5 Text-to-Speech

**File: `backend/services/voice/tts.py`**

```python
"""
Text-to-speech for voice agent responses.

Primary: edge-tts (Microsoft, free, no API key needed, good quality)
Alternative: kokoro (open-source, requires GPU for best quality)

Usage:
    tts = TTSEngine()
    audio_bytes = await tts.speak("I'm alerting security now.")
"""
import asyncio
from config.settings import settings

class TTSEngine:
    def __init__(self):
        self.engine = settings.TTS_ENGINE  # edge_tts | kokoro
    
    async def speak(self, text: str, voice: str = None) -> bytes:
        """
        Convert text to speech audio bytes (MP3 format).
        
        Args:
            text: Text to speak
            voice: Voice name (engine-specific). None = default.
        
        Returns:
            bytes: MP3 audio data
        """
        if self.engine == "edge_tts":
            return await self._speak_edge(text, voice)
        elif self.engine == "kokoro":
            return await self._speak_kokoro(text, voice)
        else:
            return await self._speak_edge(text, voice)
    
    async def _speak_edge(self, text: str, voice: str = None) -> bytes:
        """Use Microsoft Edge TTS (free, no API key)."""
        import edge_tts
        import io
        
        # Good voices for security context (calm, professional):
        # en-US-GuyNeural (male), en-US-JennyNeural (female)
        # en-SG-WayneNeural (Singapore English male)
        if voice is None:
            voice = "en-US-GuyNeural"
        
        communicate = edge_tts.Communicate(text, voice)
        audio_bytes = io.BytesIO()
        
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_bytes.write(chunk["data"])
        
        return audio_bytes.getvalue()
    
    async def _speak_kokoro(self, text: str, voice: str = None) -> bytes:
        """
        Use Kokoro TTS (open-source).
        Install: pip install kokoro>=0.3.0

            start = end - overlap
        
        return chunks if chunks else [text]
```

**File: `scripts/index_knowledge.py`**

```python
"""
Index all knowledge base documents into ChromaDB.
Run this ONCE after setting up the project.

Usage:
    cd backend
    python ../scripts/index_knowledge.py
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from pathlib import Path
from services.intelligence.rag import RAGPipeline

def index_all():
    rag = RAGPipeline()
    rag.load()
    
    data_dir = Path("data/knowledge_base")
    
    # Index SOPs
    sops_dir = data_dir / "sops"
    if sops_dir.exists():
        for sop_file in sops_dir.glob("*.md"):
            text = sop_file.read_text()
            # Extract tags from filename
            tags = sop_file.stem.split("_")
            rag.index_document(
                text=text,
                source=sop_file.name,
                doc_type="sop",
                tags=tags,
            )
            print(f"  Indexed SOP: {sop_file.name}")
    
    # Index contacts
    contacts_dir = data_dir / "contacts"
    if contacts_dir.exists():
        import json
        for contact_file in contacts_dir.glob("*.json"):
            data = json.loads(contact_file.read_text())
            text = json.dumps(data, indent=2)
            rag.index_document(
                text=text,
                source=contact_file.name,
                doc_type="contact",
                tags=["contacts", "emergency"],
            )
            print(f"  Indexed contacts: {contact_file.name}")
    
    # Index regulations
    regs_dir = data_dir / "regulations"
    if regs_dir.exists():
        for reg_file in regs_dir.glob("*.md"):
            text = reg_file.read_text()
            rag.index_document(
                text=text,
                source=reg_file.name,
                doc_type="regulation",
                tags=["regulation", "icao", "caas"],
            )
            print(f"  Indexed regulation: {reg_file.name}")
    
    # Index location data
    locs_dir = data_dir / "locations"
    if locs_dir.exists():
        import json
        for loc_file in locs_dir.glob("*.json"):
            data = json.loads(loc_file.read_text())
            for loc_id, loc_data in data.items():
                text = f"Location: {loc_data.get('name', loc_id)}\n"
                text += f"Terminal: {loc_data.get('terminal', 'Unknown')}\n"
                text += f"Zone type: {loc_data.get('zone_type', 'Unknown')}\n"
                text += f"Security level: {loc_data.get('security_level', 0)}\n"
                text += f"Cameras: {', '.join(c['id'] for c in loc_data.get('cameras', []))}\n"
                text += f"SOP tags: {', '.join(loc_data.get('sop_tags', []))}\n"
                
                rag.index_document(
                    text=text,
                    source=f"location_{loc_id}",
                    doc_type="location",
                    tags=loc_data.get("sop_tags", []) + [loc_data.get("terminal", "")],
                )
            print(f"  Indexed locations: {loc_file.name}")
    
    print(f"\n✅ Knowledge base indexed. Total documents: {rag.collection.count()}")

if __name__ == "__main__":
    index_all()
```

---

## 8. Voice Agent

**File: `backend/services/voice/agent.py`**

```python
"""
Voice Agent Conversation Manager.

Handles incoming distress/intercom calls:
1. Answers with calm, professional greeting
2. Gathers information (location, situation, people affected)
3. Classifies urgency in real-time
4. Raises alerts to SOC dashboard via WebSocket
5. Maintains conversation until SOC takes over
6. Seamless handoff when operator clicks "Take Over"

The conversation is managed as a stateful loop:
  audio_in → Whisper STT → LLM response → TTS → audio_out
  Each turn updates the incident context and may trigger SOC alerts.
"""
import uuid
import asyncio
from datetime import datetime
from typing import Optional, List
from dataclasses import dataclass, field
from services.audio.whisper_stt import WhisperSTT
from services.voice.tts import TTSEngine
from services.intelligence.llm_client import LLMClient
from api.websocket.manager import emit_voice_event

@dataclass
class CallState:
    """State of an active voice call."""
    call_id: str
    started_at: datetime
    source_id: str                  # Intercom/phone ID
    location_id: str                # Knowledge graph key
    status: str = "active"          # active | soc_takeover | ended
    
    # Conversation history (for LLM context)
    messages: List[dict] = field(default_factory=list)
    
    # Extracted information
    situation_type: str = "unknown"
    urgency_score: float = 0.0
    people_affected: int = 0
    caller_needs: str = ""
    
    # Alert status
    alert_raised: bool = False
    incident_id: Optional[str] = None

class VoiceAgent:
    """
    Manages voice agent conversations.
    
    System prompt makes the agent calm, professional, and focused on:
    1. Safety of the caller
    2. Gathering critical information
    3. Providing reassurance
    4. Escalating to SOC when needed
    """
    
    def __init__(self, stt: WhisperSTT, tts: TTSEngine, llm: LLMClient, knowledge_graph: dict):
        self.stt = stt
        self.tts = tts
        self.llm = llm
        self.knowledge_graph = knowledge_graph
        self.active_calls: dict[str, CallState] = {}
    
    async def start_call(self, source_id: str, location_id: str) -> CallState:
        """Initialize a new call."""
        call = CallState(
            call_id=str(uuid.uuid4()),
            started_at=datetime.utcnow(),
            source_id=source_id,
            location_id=location_id,
        )
        self.active_calls[call.call_id] = call
        
        # Notify dashboard
        await emit_voice_event("call_started", {
            "call_id": call.call_id,
            "source_id": source_id,
            "location_id": location_id,
            "started_at": call.started_at.isoformat(),
        })
        
        return call
    
    async def process_audio_turn(self, call_id: str, audio_path: str) -> dict:
        """
        Process one turn of conversation:
        1. Transcribe caller audio
        2. Generate agent response
        3. Convert response to speech
        4. Check if alert should be raised
        
        Returns: {
            "transcription": str,
            "response_text": str,
            "response_audio": bytes,
            "urgency_score": float,
            "alert_raised": bool,
        }
        """
        call = self.active_calls.get(call_id)
        if not call or call.status != "active":
            return {"error": "Call not found or not active"}
        
        # 1. Transcribe
        transcription = self.stt.transcribe(audio_path)
        caller_text = transcription.text
        
        # Add to conversation history
        call.messages.append({"role": "user", "content": caller_text})
        
        # Notify dashboard with live transcription
        await emit_voice_event("transcription", {
            "call_id": call_id,
            "speaker": "caller",
            "text": caller_text,
            "timestamp": datetime.utcnow().isoformat(),
        })
        
        # 2. Generate response using LLM
        loc_data = self.knowledge_graph.get(call.location_id, {})
        system_prompt = self._build_system_prompt(call, loc_data)
        
        response_text = await self.llm.chat(
            system_prompt=system_prompt,
            messages=call.messages,
        )
        
        call.messages.append({"role": "assistant", "content": response_text})
        
        # 3. Assess urgency
        urgency = await self._assess_urgency(call)
        call.urgency_score = urgency
        
        # 4. Raise alert if needed
        alert_raised = False
        if urgency > 0.6 and not call.alert_raised:
            call.alert_raised = True
            alert_raised = True
            await emit_voice_event("alert", {
                "call_id": call_id,
                "location_id": call.location_id,
                "urgency_score": urgency,
                "situation": caller_text,
                "transcription_history": [m["content"] for m in call.messages if m["role"] == "user"],
            })
        
        # 5. Convert to speech
        response_audio = await self.tts.speak(response_text)
        
        # Notify dashboard
        await emit_voice_event("transcription", {
            "call_id": call_id,
            "speaker": "agent",
            "text": response_text,
            "timestamp": datetime.utcnow().isoformat(),
        })
        
        return {
            "transcription": caller_text,
            "response_text": response_text,
            "response_audio": response_audio,
            "urgency_score": urgency,
            "alert_raised": alert_raised,
        }
    
    async def soc_takeover(self, call_id: str):
        """SOC operator takes over the call."""
        call = self.active_calls.get(call_id)
        if call:
            call.status = "soc_takeover"
            # Agent's last message before handoff
            handoff_text = (
                "I'm now connecting you with our security operations team "
                "who will assist you further. Stay calm, help is on the way."
            )
            await emit_voice_event("handoff", {
                "call_id": call_id,
                "handoff_message": handoff_text,
                "conversation_history": call.messages,
            })
            return handoff_text
        return None
    
    async def end_call(self, call_id: str):
        """End a call."""
        call = self.active_calls.get(call_id)
        if call:
            call.status = "ended"
            await emit_voice_event("call_ended", {"call_id": call_id})
    
    async def _assess_urgency(self, call: CallState) -> float:
        """Use LLM to assess urgency of the conversation so far."""
        conversation_text = "\n".join(
            f"{'Caller' if m['role'] == 'user' else 'Agent'}: {m['content']}"
            for m in call.messages
        )
        
        prompt = f"""Rate the urgency of this security call from 0.0 (routine) to 1.0 (life-threatening).
Respond with ONLY a number between 0.0 and 1.0.

Conversation:
{conversation_text}

Urgency score:"""
        
        try:
            response = await self.llm.chat(
                system_prompt="You are an urgency classifier. Respond with only a float number.",
                messages=[{"role": "user", "content": prompt}],
            )
            return min(max(float(response.strip()), 0.0), 1.0)
        except (ValueError, TypeError):
            return 0.5  # Default moderate urgency if parsing fails
    
    def _build_system_prompt(self, call: CallState, loc_data: dict) -> str:
        """Build the voice agent system prompt. SEE SECTION 22 FOR FULL TEMPLATE."""
        return VOICE_AGENT_SYSTEM_PROMPT.format(
            location_name=loc_data.get("name", call.location_id),
            location_id=call.location_id,
            terminal=loc_data.get("terminal", "Unknown"),
            camera_list=", ".join(c["id"] for c in loc_data.get("cameras", [])),
            nearest_responders=", ".join(
                r["team"] for r in loc_data.get("nearest_responders", [])
            ),
        )

# Import the prompt template (defined in Section 22)
VOICE_AGENT_SYSTEM_PROMPT = """You are AEGIS Voice Agent, a calm and professional security operations assistant at Singapore Changi Airport. You handle incoming distress and intercom calls.

Your priorities, in order:
1. SAFETY: Ensure caller safety. If medical emergency, guide basic first aid.
2. INFORMATION: Gather location, nature of incident, number of people affected.
3. REASSURANCE: Keep caller calm. Help is being dispatched.
4. ESCALATION: Flag any security threats for SOC.

Rules:
- Never reveal security procedures or internal protocols to callers.
- Use simple, clear language. The caller may be panicking.
- Always confirm location: terminal, gate/zone, floor, landmarks.
- If unsure about severity, assume higher severity.
- Keep responses SHORT (2-3 sentences max). The caller needs quick help, not essays.

Current call context:
- Location: {location_name} ({location_id})
- Terminal: {terminal}
- Nearby cameras: {camera_list}
- Nearest responders: {nearest_responders}"""
```

---

## 9. Response Recommendation Engine

**File: `backend/services/intelligence/response_engine.py`**

```python
"""
Generates ranked response recommendations for incidents.

Takes an incident context + RAG-retrieved SOPs → sends to LLM → 
returns structured recommendations.
"""
import json
from typing import Optional
from services.intelligence.rag import RAGPipeline, RetrievedDocument
from services.intelligence.llm_client import LLMClient
from services.fusion.engine import Incident
from services.intelligence.prompts import RESPONSE_RECOMMENDATION_PROMPT

class ResponseEngine:
    def __init__(self, rag: RAGPipeline, llm: LLMClient, knowledge_graph: dict):
        self.rag = rag
        self.llm = llm
        self.knowledge_graph = knowledge_graph
    
    async def generate_response(self, incident: Incident) -> dict:
        """
        Generate ranked response recommendations for an incident.
        
        Returns: {
            "explanation": str,
            "recommendations": [
                {"action": str, "reasoning": str, "priority": int},
                ...
            ],
            "do_not": [str],
            "escalation_criteria": [str],
            "contacts": [{"name": str, "role": str, "phone": str}],
        }
        """
        # 1. Build query from incident
        query = self._build_query(incident)
        
        # 2. Retrieve relevant documents
        retrieved_docs = self.rag.retrieve(query, top_k=5)
        
        # 3. Get location data
        loc_data = self.knowledge_graph.get(incident.location_id, {})
        
        # 4. Find similar past incidents (from RAG history docs)
        similar = self.rag.retrieve(query, top_k=3, doc_type_filter="history")
        
        # 5. Build prompt
        prompt = RESPONSE_RECOMMENDATION_PROMPT.format(
            incident_json=json.dumps(self._incident_to_dict(incident), indent=2),
            retrieved_sops="\n\n---\n\n".join(d.content for d in retrieved_docs),
            location_data=json.dumps(loc_data, indent=2),
            similar_incidents="\n".join(d.content for d in similar) if similar else "None found.",
        )
        
        # 6. Get LLM response
        response_text = await self.llm.chat(
            system_prompt="You are AEGIS, an AI security advisor. Respond in valid JSON only. No markdown formatting, no backticks, just raw JSON.",
            messages=[{"role": "user", "content": prompt}],
        )
        
        # 7. Parse response
        try:
            # Strip any markdown code fences
            cleaned = response_text.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1]
            if cleaned.endswith("```"):
                cleaned = cleaned.rsplit("```", 1)[0]
            cleaned = cleaned.strip()
            
            result = json.loads(cleaned)
        except json.JSONDecodeError:
            # Fallback: return the raw text as explanation
            result = {
                "explanation": response_text,
                "recommendations": [
                    {"action": "Review incident manually", "reasoning": "AI response parsing failed", "priority": 1}
                ],
                "do_not": [],
                "escalation_criteria": [],
                "contacts": [],
            }
        
        # Update the incident with the generated response
        incident.explanation = result.get("explanation", "")
        incident.recommendations = result.get("recommendations", [])
        incident.contacts = result.get("contacts", [])
        
        return result
    
    def _build_query(self, incident: Incident) -> str:
        """Build a search query from incident events."""
        event_types = set(e.event_type for e in incident.events)
        modalities = list(incident.modalities)
        return f"{' '.join(event_types)} at {incident.zone} security incident"
    
    def _incident_to_dict(self, incident: Incident) -> dict:
        """Convert incident to a JSON-serializable dict for the prompt."""
        return {
            "incident_id": incident.incident_id,
            "severity_level": incident.severity_level,
            "severity_score": incident.severity_score,
            "confidence": incident.confidence,
            "terminal": incident.terminal,
            "zone": incident.zone,
            "location_id": incident.location_id,
            "modalities": list(incident.modalities),
            "event_count": len(incident.events),
            "events": [
                {
                    "modality": e.modality,
                    "event_type": e.event_type,
                    "anomaly_score": e.anomaly_score,
                    "source_id": e.source_id,
                    "transcription": e.transcription,
                }
                for e in incident.events
            ],
        }
```

---

## 10. Training Simulation Engine

**File: `backend/services/simulation/generator.py`**

```python
"""
Training Simulation Engine.

Generates synthetic security incidents for officer training.
Loads pre-built scenario templates from data/simulations/scenarios/
and replays them in real-time via WebSocket events.

Usage:
    sim = SimulationEngine(scenarios_dir="data/simulations/scenarios")
    session = sim.start_session("SIM_001_unauthorized_access", user_id="officer_chen")
    # Events are emitted to WebSocket at scheduled intervals
    # Officer takes actions via API
    # Session ends → score calculated → debrief generated
"""
import json
import asyncio
from pathlib import Path
from datetime import datetime
from typing import Optional, List
from dataclasses import dataclass, field
from api.websocket.manager import sio

@dataclass
class SimulationAction:
    """An action taken by the officer during simulation."""
    timestamp: datetime
    action_type: str       # "dispatch", "alert", "call", "lockdown", "escalate", "observe"
    details: str
    time_from_start_seconds: float

@dataclass
class SimulationSession:
    """A training simulation session."""
    session_id: str
    user_id: str
    scenario_id: str
    scenario_data: dict
    started_at: datetime
    status: str = "active"            # active | completed | abandoned
    
    actions: List[SimulationAction] = field(default_factory=list)
    events_delivered: int = 0
    
    # Scoring (filled on completion)
    total_score: Optional[int] = None
    response_time_seconds: Optional[float] = None
    debrief: Optional[str] = None

class SimulationEngine:
    def __init__(self, scenarios_dir: str = "data/simulations/scenarios"):
        self.scenarios_dir = Path(scenarios_dir)
        self.scenarios: dict = {}
        self.active_sessions: dict[str, SimulationSession] = {}
    
    def load_scenarios(self):
        """Load all scenario templates from disk."""
        if not self.scenarios_dir.exists():
            print(f"⚠️ Scenarios directory not found: {self.scenarios_dir}")
            return
        
        for f in self.scenarios_dir.glob("*.json"):
            try:
                data = json.loads(f.read_text())
                scenario_id = data.get("scenario_id", f.stem)
                self.scenarios[scenario_id] = data
            except Exception as e:
                print(f"⚠️ Failed to load scenario {f.name}: {e}")
        
        print(f"✅ Loaded {len(self.scenarios)} simulation scenarios")
    
    def list_scenarios(self) -> List[dict]:
        """List available scenarios with metadata."""
        return [
            {
                "scenario_id": sid,
                "title": s.get("title", "Untitled"),
                "difficulty": s.get("difficulty", "unknown"),
                "severity_level": s.get("severity_level", 0),
                "duration_minutes": s.get("duration_minutes", 5),
                "description": s.get("description", ""),
            }
            for sid, s in self.scenarios.items()
        ]
    
    async def start_session(self, scenario_id: str, user_id: str) -> SimulationSession:
        """Start a training simulation session."""
        import uuid
        
        scenario = self.scenarios.get(scenario_id)
        if not scenario:
            raise ValueError(f"Scenario not found: {scenario_id}")
        
        session = SimulationSession(
            session_id=str(uuid.uuid4()),
            user_id=user_id,
            scenario_id=scenario_id,
            scenario_data=scenario,
            started_at=datetime.utcnow(),
        )
        
        self.active_sessions[session.session_id] = session
        
        # Start delivering events in background
        asyncio.create_task(self._deliver_events(session))
        
        return session
    
    async def _deliver_events(self, session: SimulationSession):
        """Deliver scenario events at scheduled times."""
        events_timeline = session.scenario_data.get("events_timeline", [])
        
        for event in events_timeline:
            if session.status != "active":
                break
            
            # Wait for the scheduled time offset
            offset = event.get("time_offset_seconds", 0)
            if session.events_delivered > 0:
                prev_offset = events_timeline[session.events_delivered - 1].get("time_offset_seconds", 0)
                wait = offset - prev_offset
            else:
                wait = offset
            
            if wait > 0:
                await asyncio.sleep(wait)
            
            # Emit event to the officer's dashboard
            await sio.emit("simulation:event", {
                "session_id": session.session_id,
                "event_index": session.events_delivered,
                "modality": event.get("modality"),
                "event_data": event.get("event", {}),
                "timestamp": datetime.utcnow().isoformat(),
            })
            
            session.events_delivered += 1
    
    def record_action(self, session_id: str, action_type: str, details: str):
        """Record an action taken by the officer."""
        session = self.active_sessions.get(session_id)
        if not session:
            return None
        
        elapsed = (datetime.utcnow() - session.started_at).total_seconds()
        
        action = SimulationAction(
            timestamp=datetime.utcnow(),
            action_type=action_type,
            details=details,
            time_from_start_seconds=elapsed,
        )
        session.actions.append(action)
        
        # Record first response time
        if session.response_time_seconds is None:
            session.response_time_seconds = elapsed
        
        return action
    
    async def end_session(self, session_id: str, llm_client=None) -> dict:
        """End a session and calculate score."""
        session = self.active_sessions.get(session_id)
        if not session:
            return {"error": "Session not found"}
        
        session.status = "completed"
        
        # Calculate score
        score = self._calculate_score(session)
        session.total_score = score["total"]
        
        # Generate debrief via LLM (if available)
        if llm_client:
            session.debrief = await self._generate_debrief(session, llm_client)
        
        return {
            "session_id": session_id,
            "scenario_id": session.scenario_id,
            "score": score,
            "response_time_seconds": session.response_time_seconds,
            "actions_taken": [
                {"type": a.action_type, "details": a.details, "time": a.time_from_start_seconds}
                for a in session.actions
            ],
            "debrief": session.debrief,
        }
    
    def _calculate_score(self, session: SimulationSession) -> dict:
        """Calculate officer's score based on rubric."""
        rubric = session.scenario_data.get("scoring_rubric", {})
        optimal = session.scenario_data.get("optimal_response", {})
        
        score = {"total": 0, "breakdown": {}}
        
        # Response time scoring
        rt = session.response_time_seconds or 999
        if rt <= 30:
            time_score = rubric.get("response_time_30s", 10)
        elif rt <= 60:
            time_score = rubric.get("response_time_60s", 7)
        elif rt <= 90:
            time_score = rubric.get("response_time_90s", 4)
        else:
            time_score = 0
        
        score["breakdown"]["response_time"] = time_score
        score["total"] += time_score
        
        # Action quality (simplified: check if any action matches optimal)
        action_types = [a.action_type for a in session.actions]
        
        if "dispatch" in action_types:
            action_score = rubric.get("correct_primary_action", 30)
            score["breakdown"]["primary_action"] = action_score
            score["total"] += action_score
        
        if len(session.actions) > 1:
            secondary_score = rubric.get("correct_secondary_action", 20)
            score["breakdown"]["secondary_action"] = secondary_score
            score["total"] += secondary_score
        
        return score
    
    async def _generate_debrief(self, session: SimulationSession, llm_client) -> str:
        """Generate AI debrief using LLM."""
        from services.intelligence.prompts import TRAINING_DEBRIEF_PROMPT
        
        prompt = TRAINING_DEBRIEF_PROMPT.format(
            scenario_json=json.dumps({
                "title": session.scenario_data.get("title"),
                "description": session.scenario_data.get("description"),
                "severity_level": session.scenario_data.get("severity_level"),
            }, indent=2),
            optimal_response=json.dumps(session.scenario_data.get("optimal_response", {}), indent=2),
            officer_actions=json.dumps([
                {"type": a.action_type, "details": a.details, "time_seconds": a.time_from_start_seconds}
                for a in session.actions
            ], indent=2),
            response_time_seconds=session.response_time_seconds or 0,
        )
        
        return await llm_client.chat(
            system_prompt="You are a security training evaluator. Be encouraging but honest.",
            messages=[{"role": "user", "content": prompt}],
        )
```

---

## 16. LLM Provider Abstraction

**File: `backend/services/intelligence/llm_client.py`**

**CRITICAL: This is the most important abstraction in the project. ALL LLM calls go through this class. It supports Claude, OpenAI, Groq, and Ollama. The provider is selected via the `LLM_PROVIDER` env var. No other code in the project should import LLM SDKs directly.**

```python
"""
LLM Client — Provider-agnostic interface for all LLM calls.

Supports: Claude (Anthropic), OpenAI, Groq, Ollama (local)
Set LLM_PROVIDER in .env to switch between providers.
Set the corresponding API key.

Usage:
    llm = LLMClient()
    response = await llm.chat(
        system_prompt="You are a security advisor.",
        messages=[{"role": "user", "content": "Assess this incident..."}],
    )
"""
import os
from typing import List, Dict, Optional
from config.settings import settings

class LLMClient:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self._client = None
        self._model = None
        self._setup()
    
    def _setup(self):
        """Initialize the appropriate LLM client based on provider."""
        if self.provider == "claude":
            import anthropic
            api_key = settings.CLAUDE_API_KEY
            if not api_key:
                raise ValueError("CLAUDE_API_KEY not set in .env")
            self._client = anthropic.Anthropic(api_key=api_key)
            self._model = settings.CLAUDE_MODEL
            print(f"✅ LLM: Claude ({self._model})")
        
        elif self.provider == "openai":
            from openai import AsyncOpenAI
            api_key = settings.OPENAI_API_KEY
            if not api_key:
                raise ValueError("OPENAI_API_KEY not set in .env")
            self._client = AsyncOpenAI(api_key=api_key)
            self._model = settings.OPENAI_MODEL
            print(f"✅ LLM: OpenAI ({self._model})")
        
        elif self.provider == "groq":
            from openai import AsyncOpenAI
            api_key = settings.GROQ_API_KEY
            if not api_key:
                raise ValueError("GROQ_API_KEY not set in .env")
            self._client = AsyncOpenAI(
                api_key=api_key,
                base_url="https://api.groq.com/openai/v1",
            )
            self._model = settings.GROQ_MODEL
            print(f"✅ LLM: Groq ({self._model})")
        
        elif self.provider == "ollama":
            from openai import AsyncOpenAI
            self._client = AsyncOpenAI(
                api_key="ollama",  # Ollama doesn't need a real key
                base_url=settings.OLLAMA_BASE_URL,
            )
            self._model = settings.OLLAMA_MODEL
            print(f"✅ LLM: Ollama ({self._model})")
        
        else:
            raise ValueError(
                f"Unknown LLM_PROVIDER: {self.provider}. "
                f"Must be one of: claude, openai, groq, ollama"
            )
    
    async def chat(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.3,
        max_tokens: int = 2000,
    ) -> str:
        """
        Send a chat completion request.
        
        Args:
            system_prompt: System message (instructions for the LLM)
            messages: List of {"role": "user"|"assistant", "content": str}
            temperature: 0.0 (deterministic) to 1.0 (creative). Default 0.3 for security.
            max_tokens: Maximum response tokens.
        
        Returns:
            str: The LLM's response text.
        """
        try:
            if self.provider == "claude":
                return await self._chat_claude(system_prompt, messages, temperature, max_tokens)
            else:
                # OpenAI, Groq, and Ollama all use the OpenAI-compatible interface
                return await self._chat_openai_compatible(system_prompt, messages, temperature, max_tokens)
        except Exception as e:
            print(f"❌ LLM error ({self.provider}): {e}")
            return f"[LLM Error: {str(e)}. Check your API key and network connection.]"
    
    async def _chat_claude(
        self, system_prompt: str, messages: list, temperature: float, max_tokens: int
    ) -> str:
        """Claude uses a different API format (not OpenAI-compatible)."""
        import asyncio
        
        # Claude SDK is synchronous, so run in executor
        def _call():
            response = self._client.messages.create(
                model=self._model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_prompt,
                messages=messages,
            )
            return response.content[0].text
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _call)
    
    async def _chat_openai_compatible(
        self, system_prompt: str, messages: list, temperature: float, max_tokens: int
    ) -> str:
        """OpenAI, Groq, and Ollama all use this format."""
        full_messages = [{"role": "system", "content": system_prompt}] + messages
        
        response = await self._client.chat.completions.create(
            model=self._model,
            messages=full_messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        
        return response.choices[0].message.content
```

---

## 12. Frontend Implementation

### 12.1 Dashboard Layout Specification

**The dashboard is a split-screen layout. This is the core UI of the product.**

```
┌─────────────────────────────────────────────────────────────────┐
│  AEGIS   │ Incidents │ Cameras │ Training │ Reports │ 🔔  👤   │
├────────────────────────────┬────────────────────────────────────┤
│    LEFT PANEL (60%)        │    RIGHT PANEL (40%)               │
│                            │                                    │
│  Camera Feeds / Frames     │  Situation Assessment              │
│  Anomaly Heatmaps          │  Severity Badge + Score            │
│  Audio Waveform + Caption  │  Natural Language Explanation      │
│  Sensor Event Timeline     │  ──────────────────────            │
│                            │  Recommended Actions (ranked)      │
│  ─────────────────────     │    1. [Dispatch] [View SOP]        │
│  Incident Queue            │    2. [Call] [Alert]               │
│  (sorted by severity)      │    3. [Initiate]                   │
│    🔴 HIGH - T2 Gate B4    │  ──────────────────────            │
│    🟡 MED  - T3 Cargo      │  Emergency Contacts               │
│    🟢 INFO - T1 Zone A     │  ──────────────────────            │
│                            │  Similar Past Incidents            │
│  ─────────────────────     │  ──────────────────────            │
│  Voice Agent Status        │  [Share] [Export] [Transfer]       │
│  🟢 Active: T2 Lift B3    │                                    │
│  [TAKE OVER] [MUTE]       │                                    │
├────────────────────────────┴────────────────────────────────────┤
│  Connected │ Models: ✅ Video ✅ Audio ✅ LLM │ Uptime: 47h    │
└─────────────────────────────────────────────────────────────────┘
```

### 12.2 Color System

Use these exact colors for severity throughout the UI:

```typescript
// frontend/src/utils/severity.ts
export const SEVERITY_CONFIG = {
  5: { name: 'CRITICAL', color: '#DC2626', bg: '#FEE2E2', icon: '🔴', textColor: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-500' },
  4: { name: 'HIGH',     color: '#EA580C', bg: '#FFF7ED', icon: '🟠', textColor: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-500' },
  3: { name: 'MEDIUM',   color: '#CA8A04', bg: '#FEFCE8', icon: '🟡', textColor: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-500' },
  2: { name: 'LOW',      color: '#2563EB', bg: '#EFF6FF', icon: '🔵', textColor: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-500' },
  1: { name: 'INFO',     color: '#16A34A', bg: '#F0FDF4', icon: '🟢', textColor: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-500' },
} as const;
```

### 12.3 Key Frontend Types

**File: `frontend/src/types/incident.ts`**

```typescript
export interface RawEvent {
  event_id: string;
  timestamp: string;
  modality: 'video' | 'audio' | 'log' | 'sensor';
  source_id: string;
  event_type: string;
  anomaly_score: number;
  location_id: string;
  data: Record<string, any>;
  frame_path?: string;
  heatmap_path?: string;
  audio_path?: string;
  transcription?: string;
}

export interface Incident {
  incident_id: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'investigating' | 'resolved' | 'false_alarm';
  severity_level: 1 | 2 | 3 | 4 | 5;
  severity_score: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  terminal: string;
  zone: string;
  location_id: string;
  events: RawEvent[];
  modalities: string[];
  explanation: string;
  recommendations: Recommendation[];
  contacts: Contact[];
}

export interface Recommendation {
  action: string;
  reasoning: string;
  priority: number;
}

export interface Contact {
  name: string;
  role: string;
  phone: string;
}

export interface VoiceCall {
  call_id: string;
  source_id: string;
  location_id: string;
  started_at: string;
  status: 'active' | 'soc_takeover' | 'ended';
  transcription: TranscriptionEntry[];
  urgency_score: number;
}

export interface TranscriptionEntry {
  speaker: 'caller' | 'agent';
  text: string;
  timestamp: string;
}
```

---

## 17. Knowledge Base Documents

**These are the documents that get embedded into ChromaDB via RAG. Create each file with the exact content shown. These are publicly available security best practices, NOT proprietary Certis procedures.**

### 17.1 Sample SOP: Unauthorized Access

**File: `data/knowledge_base/sops/unauthorized_access.md`**

```markdown
# SOP: Unauthorized Access to Restricted Area

## Severity: HIGH (Level 4)

## Trigger Conditions
- Access control system logs a failed authentication at a restricted zone entry point
- Visual detection of person in restricted area without visible credentials
- Motion sensor activated in restricted area during non-operational hours
- Report from officer or member of public about unauthorized individual

## Immediate Actions (in order of priority)
1. Verify via nearest CCTV camera to confirm visual of unauthorized individual
2. Dispatch nearest patrol team to intercept (minimum 2 officers, do NOT approach alone)
3. Notify Shift Commander via radio
4. If airside location: Notify Airport Police Division (APD) duty officer immediately
5. If individual is cooperative: verify identity, escort to appropriate area, document
6. If individual is non-cooperative or threatening: maintain safe distance, await APD, cordon area

## Do NOT
- Engage physically unless there is immediate danger to life
- Trigger full terminal evacuation (disproportionate for single individual unless armed)
- Use public address system to announce the specific incident (avoid panic)

## Escalation Criteria
- Individual is armed or makes threats: Escalate to Severity 5 (CRITICAL), activate APD and SPF
- Individual has accessed aircraft or runway: Escalate to Severity 5, full aviation security protocol
- Multiple unauthorized individuals detected: Escalate to Severity 5, potential coordinated breach
- Individual refuses to identify themselves and attempts to flee: Maintain visual contact, APD pursuit

## Post-Incident
- Document: time of detection, response time, individual identity if established, actions taken
- File incident report within 2 hours
- Review CCTV footage for 30 minutes prior to incident to check for accomplices
- Assess whether access point security needs enhancement
```

### 17.2 Sample SOP: Medical Emergency

**File: `data/knowledge_base/sops/medical_emergency.md`**

```markdown
# SOP: Medical Emergency

## Severity: MEDIUM (Level 3) — escalate to HIGH if life-threatening

## Trigger Conditions
- Intercom distress call reporting medical incident
- Visual detection of person collapsed or in medical distress
- Request from airline crew or airport staff for medical assistance
- AED alarm activation

## Immediate Actions
1. Confirm location precisely (terminal, gate, floor, nearest landmark)
2. Dispatch nearest medical response team or first-aid trained officer
3. If cardiac arrest suspected: direct nearest officer to retrieve AED from closest station
4. If caller is with the patient: provide basic guidance (check consciousness, breathing)
5. Notify airport medical center for paramedic dispatch
6. Clear area around patient (ask bystanders to step back)
7. If ambulance needed: coordinate with ambulance dispatch, direct to nearest vehicle access point

## Do NOT
- Move the patient unless they are in immediate danger (fire, structural collapse)
- Administer medication unless you are a qualified medical professional
- Delay calling for professional medical help while attempting first aid

## Escalation Criteria
- Patient is not breathing or has no pulse: Severity 4 (HIGH), immediate AED + CPR
- Mass casualty event (multiple patients): Severity 5 (CRITICAL), activate mass casualty protocol
- Suspected infectious disease: Severity 4, activate quarantine protocol, notify Ministry of Health

## Post-Incident
- Document: patient details (if known), condition, actions taken, response time
- Preserve scene if patient outcome is fatal (potential coroner investigation)
- Debrief responding officers
```

### 17.3 Location Data

**File: `data/knowledge_base/locations/changi_zones.json`**

```json
{
  "T2_GATE_B4": {
    "name": "Terminal 2, Gate B4",
    "terminal": "T2",
    "floor": "L2",
    "zone_type": "airside_gate",
    "security_level": 3,
    "cameras": [
      {"id": "T2_GATE_B4_CAM12", "type": "fixed", "resolution": "1080p"},
      {"id": "T2_GATE_B4_CAM13", "type": "ptz", "resolution": "4K"}
    ],
    "sensors": [
      {"id": "T2_GATE_B4_MOTION", "type": "motion"},
      {"id": "T2_GATE_B4_DOOR", "type": "door_contact"}
    ],
    "intercoms": ["T2_INTERCOM_GATE_B4"],
    "access_points": [
      {"id": "T2_GATE_B4_DOOR", "required_clearance": 3}
    ],
    "nearest_responders": [
      {"team": "T2_PATROL_TEAM_B", "avg_response_seconds": 120},
      {"team": "T2_MEDICAL_POST", "avg_response_seconds": 180}
    ],
    "sop_tags": [
      "unauthorized_access", "tailgating", "unattended_baggage",
      "medical_emergency", "aggressive_behavior"
    ],
    "adjacent_zones": ["T2_GATE_B3", "T2_GATE_B5", "T2_CORRIDOR_B"]
  },
  "T2_LIFT_B3": {
    "name": "Terminal 2, Lift B3",
    "terminal": "T2",
    "floor": "B1-L3",
    "zone_type": "vertical_transport",
    "security_level": 1,
    "cameras": [
      {"id": "T2_LIFT_B3_CAM_INT", "type": "fixed", "resolution": "720p"},
      {"id": "T2_LOBBY_CAM08", "type": "fixed", "resolution": "1080p"}
    ],
    "sensors": [
      {"id": "T2_LIFT_B3_MOTION", "type": "motion"},
      {"id": "T2_LIFT_B3_DOOR", "type": "door_contact"}
    ],
    "intercoms": ["T2_INTERCOM_LIFT_B3"],
    "access_points": [],
    "nearest_responders": [
      {"team": "T2_PATROL_TEAM_B", "avg_response_seconds": 90},
      {"team": "T2_MEDICAL_POST", "avg_response_seconds": 150},
      {"team": "T2_MAINTENANCE", "avg_response_seconds": 300}
    ],
    "sop_tags": [
      "lift_breakdown", "medical_emergency", "trapped_person"
    ],
    "adjacent_zones": ["T2_LOBBY_B", "T2_CORRIDOR_B"]
  },
  "T3_CARGO_BAY_C": {
    "name": "Terminal 3, Cargo Bay C",
    "terminal": "T3",
    "floor": "G",
    "zone_type": "cargo_restricted",
    "security_level": 4,
    "cameras": [
      {"id": "T3_CARGO_C_CAM01", "type": "fixed", "resolution": "4K"},
      {"id": "T3_CARGO_C_CAM02", "type": "ptz", "resolution": "4K"},
      {"id": "T3_CARGO_C_CAM03", "type": "fixed", "resolution": "1080p"}
    ],
    "sensors": [
      {"id": "T3_CARGO_C_MOTION_01", "type": "motion"},
      {"id": "T3_CARGO_C_MOTION_02", "type": "motion"},
      {"id": "T3_CARGO_C_DOOR_MAIN", "type": "door_contact"},
      {"id": "T3_CARGO_C_SMOKE", "type": "smoke_detector"},
      {"id": "T3_CARGO_C_TEMP", "type": "temperature"}
    ],
    "intercoms": ["T3_INTERCOM_CARGO_C"],
    "access_points": [
      {"id": "T3_CARGO_C_DOOR_MAIN", "required_clearance": 4},
      {"id": "T3_CARGO_C_VEHICLE_GATE", "required_clearance": 4}
    ],
    "nearest_responders": [
      {"team": "T3_CARGO_SECURITY", "avg_response_seconds": 60},
      {"team": "T3_FIRE_STATION", "avg_response_seconds": 120}
    ],
    "sop_tags": [
      "unauthorized_access", "hazmat_spill", "fire_evacuation",
      "suspicious_package", "cargo_theft"
    ],
    "adjacent_zones": ["T3_CARGO_BAY_B", "T3_CARGO_BAY_D", "T3_VEHICLE_ROAD"]
  }
}
```

### 17.4 Contacts

**File: `data/knowledge_base/contacts/changi_contacts.json`**

```json
{
  "emergency_contacts": [
    {"name": "Airport Police Division (APD)", "role": "Law enforcement authority", "phone": "+65 6595 6000", "available": "24/7"},
    {"name": "Airport Emergency Services (ARFF)", "role": "Fire and rescue", "phone": "+65 6595 6100", "available": "24/7"},
    {"name": "Airport Medical Centre", "role": "Medical emergencies", "phone": "+65 6595 6200", "available": "24/7"},
    {"name": "Singapore Civil Defence Force", "role": "Fire, rescue, ambulance", "phone": "995", "available": "24/7"},
    {"name": "Singapore Police Force", "role": "Police emergency", "phone": "999", "available": "24/7"}
  ],
  "operational_contacts": [
    {"name": "CAG Operations Centre", "role": "Airport operations coordination", "phone": "+65 6595 6300", "available": "24/7"},
    {"name": "CAAS Duty Manager", "role": "Aviation authority", "phone": "+65 6595 6400", "available": "24/7"},
    {"name": "Certis SOC Supervisor", "role": "Security shift commander", "phone": "Radio Channel 4", "available": "24/7"},
    {"name": "ICA Duty Officer", "role": "Immigration & Checkpoints", "phone": "+65 6595 6500", "available": "24/7"}
  ],
  "terminal_contacts": {
    "T1": {"security_supervisor": "+65 6595 7100", "maintenance": "+65 6595 7101"},
    "T2": {"security_supervisor": "+65 6595 7200", "maintenance": "+65 6595 7201"},
    "T3": {"security_supervisor": "+65 6595 7300", "maintenance": "+65 6595 7301"},
    "T4": {"security_supervisor": "+65 6595 7400", "maintenance": "+65 6595 7401"},
    "Jewel": {"security_supervisor": "+65 6595 7500", "maintenance": "+65 6595 7501"}
  }
}
```

---

## 18. Simulation Scenarios

**File: `data/simulations/scenarios/SIM_001_unauthorized_access.json`**

```json
{
  "scenario_id": "SIM_001",
  "title": "Unauthorized Airside Access at Terminal 2",
  "difficulty": "intermediate",
  "severity_level": 4,
  "duration_minutes": 5,
  "description": "A person without valid credentials enters the airside zone through a gate that was briefly left unattended during a shift change. Multiple detection systems trigger sequentially.",
  "events_timeline": [
    {
      "time_offset_seconds": 0,
      "modality": "sensor",
      "event": {
        "type": "door_alarm",
        "source_id": "T2_GATE_B4_DOOR",
        "location_id": "T2_GATE_B4",
        "anomaly_score": 0.7,
        "details": "Door opened without valid badge scan at airside gate B4"
      }
    },
    {
      "time_offset_seconds": 5,
      "modality": "video",
      "event": {
        "type": "visual_anomaly",
        "source_id": "T2_GATE_B4_CAM12",
        "location_id": "T2_GATE_B4",
        "anomaly_score": 0.82,
        "frame_path": "sim_frames/unauth_001_frame1.jpg",
        "heatmap_path": "sim_frames/unauth_001_heat1.png",
        "details": "Person detected in airside zone without visible credentials"
      }
    },
    {
      "time_offset_seconds": 15,
      "modality": "log",
      "event": {
        "type": "access_control_failure",
        "source_id": "T2_GATE_B4_DOOR",
        "location_id": "T2_GATE_B4",
        "anomaly_score": 0.75,
        "details": "Access attempt with Level 1 badge at Level 3 door. Clearance mismatch."
      }
    },
    {
      "time_offset_seconds": 30,
      "modality": "audio",
      "event": {
        "type": "intercom_call",
        "source_id": "T2_INTERCOM_GATE_B4",
        "location_id": "T2_GATE_B4",
        "anomaly_score": 0.4,
        "transcription": "Excuse me, I think I went through the wrong door. Can someone help me? I'm trying to get to my gate.",
        "details": "Caller appears confused, not hostile. Possible transit passenger who entered restricted area by mistake."
      }
    }
  ],
  "optimal_response": {
    "primary_action": "Dispatch T2 Patrol Team B to Gate B4 to intercept and verify identity",
    "secondary_action": "Pull up live feeds from T2_GATE_B4_CAM12 and CAM13 for visual confirmation",
    "tertiary_action": "Check departure board for passenger manifest matching the area",
    "do_not": "Do NOT trigger full terminal lockdown — disproportionate for confused passenger",
    "escalation": "Escalate to APD ONLY if individual refuses to cooperate or additional threat indicators emerge",
    "expected_response_time_seconds": 30
  },
  "scoring_rubric": {
    "response_time_30s": 10,
    "response_time_60s": 7,
    "response_time_90s": 4,
    "correct_primary_action": 30,
    "correct_secondary_action": 20,
    "appropriate_escalation": 20,
    "no_over_reaction": 10,
    "communication_quality": 10
  }
}
```

---

## 21. Error Handling & Fallbacks

**Every module must handle errors gracefully. Here are the rules:**

### 21.1 AI Model Failures

```python
# RULE: If any AI model fails to load, the system continues with a mock/fallback.
# The dashboard shows a yellow warning icon for that model.
# Mock detectors return plausible but clearly labeled results.

# Pattern for all AI service classes:
class AnyAIService:
    def __init__(self):
        self._loaded = False
    
    def load(self):
        try:
            # ... load model ...
            self._loaded = True
        except Exception as e:
            print(f"⚠️ {self.__class__.__name__} load failed: {e}. Using mock.")
            self._loaded = False
    
    def process(self, input):
        if self._loaded:
            return self._process_real(input)
        else:
            return self._process_mock(input)
```

### 21.2 LLM API Failures

```python
# RULE: If LLM call fails, return a structured fallback response.
# Never crash. Never leave the dashboard empty.

# In llm_client.py chat() method:
try:
    response = await self._call_llm(...)
    return response
except Exception as e:
    return f"[AEGIS: Unable to generate AI response. Error: {str(e)}. Please assess the situation manually using the data displayed on the left panel.]"
```

### 21.3 Database Failures

```python
# RULE: If PostgreSQL is down, log incidents to Redis as backup.
# When PostgreSQL recovers, replay from Redis.

# RULE: If Redis is down, use in-memory event bus (Python asyncio.Queue).
# WebSocket events will still work within a single server instance.
```

### 21.4 Missing API Keys

```python
# RULE: On startup, check all required API keys.
# If LLM_PROVIDER is set but its API key is missing, print clear error and exit.
# Do NOT silently fall back to a different provider.

# In settings.py or main.py startup:
if settings.LLM_PROVIDER == "groq" and not settings.GROQ_API_KEY:
    raise ValueError(
        "LLM_PROVIDER is 'groq' but GROQ_API_KEY is not set.\n"
        "Either set GROQ_API_KEY in .env, or change LLM_PROVIDER to 'ollama' for local inference."
    )
```

---

## 22. Prompt Templates (Verbatim)

**These prompts must be used EXACTLY as written. They are stored in `backend/services/intelligence/prompts.py`. Claude Code should copy them verbatim.**

**File: `backend/services/intelligence/prompts.py`**

```python
"""
All LLM prompt templates for AEGIS.

IMPORTANT: These prompts are carefully engineered for security operations context.
Do not modify them without testing thoroughly.
"""

RESPONSE_RECOMMENDATION_PROMPT = """You are AEGIS, an AI security advisor for airport security operations at Singapore Changi Airport.

INCIDENT CONTEXT:
{incident_json}

RETRIEVED SECURITY PROCEDURES:
{retrieved_sops}

LOCATION CONTEXT:
{location_data}

HISTORICAL SIMILAR INCIDENTS:
{similar_incidents}

Based on the above, provide a response in this exact JSON format:
{{
  "explanation": "2-3 sentences explaining what is happening and why it requires attention",
  "recommendations": [
    {{
      "action": "Clear directive of what to do",
      "reasoning": "Why this action is appropriate",
      "priority": 1
    }},
    {{
      "action": "Second action",
      "reasoning": "Why",
      "priority": 2
    }}
  ],
  "do_not": ["Action to explicitly avoid", "Another action to avoid"],
  "escalation_criteria": ["When to escalate to higher severity"],
  "contacts": [
    {{
      "name": "Contact name",
      "role": "Their role",
      "phone": "Phone number"
    }}
  ]
}}

Rules:
- Provide 3-5 ranked recommendations
- Keep recommendations PROPORTIONATE to the severity level
- Never recommend lethal force unless there is imminent threat to life
- Always prioritize de-escalation
- Include specific contact information from the location data
- Reference specific SOPs where relevant
- Respond with ONLY valid JSON. No markdown, no explanation outside the JSON."""


TRAINING_DEBRIEF_PROMPT = """You are a security training evaluator at Singapore Changi Airport. An officer just completed a simulation scenario. Evaluate their performance.

SCENARIO:
{scenario_json}

OPTIMAL RESPONSE:
{optimal_response}

OFFICER'S ACTIONS:
{officer_actions}

OFFICER'S RESPONSE TIME: {response_time_seconds} seconds

Provide a training debrief covering:

1. SCORE SUMMARY: How the officer performed overall (use specific numbers)

2. WHAT WENT WELL: Specific positive actions the officer took. Be genuine and encouraging.

3. AREAS FOR IMPROVEMENT: Specific, constructive feedback. Reference what the optimal response was and how the officer's actions differed.

4. KEY LEARNING POINTS: 2-3 takeaways the officer should remember for next time.

5. OVERALL ASSESSMENT: One paragraph summary.

Keep the tone professional, encouraging, and constructive. This is a learning exercise, not a punishment."""


DAILY_REPORT_PROMPT = """You are AEGIS, generating a daily security operations summary for the SOC supervisor at Singapore Changi Airport.

DATE: {date}

INCIDENT DATA:
{incidents_json}

Generate a concise daily report covering:
1. Summary statistics (total incidents by severity, average response time)
2. Notable incidents (severity 3+) with brief details and resolution
3. Patterns observed (time-based, location-based, type-based)
4. Recommendations for the next shift

Keep it concise and actionable. Use bullet points. Focus on what the supervisor needs to know for handoff."""


MONTHLY_REPORT_PROMPT = """You are AEGIS, generating a monthly intelligence summary for security management at Singapore Changi Airport.

MONTH: {month}

AGGREGATED DATA:
{monthly_data_json}

Generate an intelligence report covering:
1. Trend analysis (comparison to previous month, changes in incident types/locations)
2. Predictive insights (patterns that suggest future risks)
3. Security assignment recommendations (where to add/reduce personnel based on data)
4. Training recommendations (which officers need refreshers, which scenarios to emphasize)
5. System performance (model accuracy, response times, voice agent effectiveness)

Be analytical and data-driven. Include specific numbers and percentages where possible."""
```

---

## 23. Appendix: Certis & Domain Context

**This section gives Claude Code the background context to make intelligent decisions when building features. Read this if you need to understand WHY something is designed a certain way.**

### 23.1 What is Certis?

Certis Group is Singapore's leading security company, wholly owned by Temasek Holdings. They originated from the Singapore Police Force's Guard & Escort Unit in 1958, became CISCO in 1972, and rebranded to Certis in 2018. They employ 33,000+ people across Singapore, Australia, Hong Kong, and Qatar. They are one of five licensed auxiliary police forces in Singapore.

### 23.2 Certis at Changi Airport

Certis runs a 4,000-person security operation at Changi Airport under a contract valued at S$680M+. They monitor 2,000+ CCTV cameras, handle passenger screening at all terminals, and manage access control to restricted areas. They have been awarded Changi's "Service Partner of the Year" for 3 consecutive years.

### 23.3 Mozart Platform

Mozart is Certis' proprietary AI orchestration platform. It unifies data from CCTV, IoT sensors, BMS, and enterprise systems into one command centre. It automates workflows, dispatches personnel, and provides dashboards. It is ISO15408 EAL2 certified. Deployed at Changi, Jewel, One Bangkok, HKSTP, and other major properties.

**What Mozart does well:** Operational orchestration, workflow automation, unified dashboard, asset management, workforce dispatch.

**What Mozart does NOT do (and AEGIS fills):**
- Natural language explanation of anomalies
- Ranked response recommendations with reasoning
- Autonomous voice agent for handling distress calls
- Officer training simulations with scoring
- Predictive intelligence from historical pattern analysis

### 23.4 NAISC 2026 Competition

National AI Student Challenge 2026, run by AI Singapore. Grand Finals are May 22-23, 2026 at the AI Student Developer Conference. The Certis challenge track asks teams to build a "Multimodal Security Response Advisor." Live demo capped at 5 minutes. Deliverables: slides with video demo, live demo, GitHub repository.

### 23.5 Key Design Decision: AEGIS is Mozart-Complementary

AEGIS is designed to work ALONGSIDE Mozart (taking data feeds from Mozart's unified command layer and adding intelligence/explanation/voice/training on top), OR independently (running with its own data ingestion). The architecture uses clean API boundaries so either deployment mode works. In code, this means the data ingestion layer has both a "direct source" mode (CCTV/audio/logs directly) and a "Mozart API" mode (receiving pre-processed events from Mozart). For the hackathon, we use direct source mode.

---

## END OF SPECIFICATION

**This document is the single source of truth for building AEGIS. When starting a new chat with Claude Code, paste this document (or reference it) and say: "Build AEGIS following this spec, starting from Phase 1."**

**Project Codename:** AEGIS
**Full Name:** Adaptive Engagement & Guided Intelligence for Security
**Tagline:** See. Hear. Understand. Respond.
**For:** NAISC 2026 Grand Finals — Certis Challenge Track
