# AEGIS — Adaptive Engagement & Guided Intelligence for Security

**Multimodal AI-Powered Security Response Advisor for Airport Security Operations Centres**

Built for NAISC 2026 Grand Finals — Certis Challenge Track

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker Desktop
- An LLM API key (Groq is free: groq.com)

### Setup (3 commands)

```bash
cd aegis

# Copy and fill in your API key
cp .env.example .env
# Edit .env: set GROQ_API_KEY=your_key_here

# Run full setup
bash scripts/setup.sh
```

### Start

```bash
# Terminal 1 — Backend
cd aegis/backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — Frontend
cd aegis/frontend
npm run dev
```

Open **http://localhost:5173** · Login: `admin` / `admin`

---

## Architecture

```
[CCTV/Audio/Sensors/Access Logs]
         ↓
   AI Fusion Engine
   ├── Video: Anomalib (OpenVINO inference)
   ├── Audio: PANNs + CLAP + Whisper
   └── Sensor/Log: Rule-based parsing
         ↓
  Incident Correlator
  (time window + spatial adjacency)
         ↓
  RAG Pipeline (ChromaDB + MiniLM)
  + LLM Response Engine (Claude/Groq/OpenAI/Ollama)
         ↓
  SOC Dashboard (React + Socket.IO)
  ├── Real-time incident list
  ├── AI situation assessment
  ├── Prioritized action recommendations
  ├── Voice Agent (STT → LLM → TTS)
  ├── Training Simulator (10 scenarios)
  └── Intelligence Reports (daily/monthly/predictive)
```

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI + Python-SocketIO (ASGI) |
| Database | PostgreSQL 16 (async SQLAlchemy) |
| Cache/Events | Redis 7 |
| Video AI | Anomalib (EfficientAD), OpenCV |
| Audio AI | PANNs (AudioSet), CLAP (zero-shot), Whisper (STT) |
| TTS | Edge-TTS (Microsoft, free) / Kokoro |
| RAG | ChromaDB + sentence-transformers (all-MiniLM-L6-v2) |
| LLM | Claude / Groq / OpenAI / Ollama (configurable) |
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Real-time | Socket.IO (WebSocket) |
| Containers | Docker Compose |

## Configuration

Edit `aegis/.env` to configure:

```env
LLM_PROVIDER=groq          # claude | openai | groq | ollama
GROQ_API_KEY=your_key
WHISPER_MODEL=base         # tiny | base | small | medium
TTS_ENGINE=edge_tts        # edge_tts | kokoro
```

## API Reference

| Endpoint | Description |
|---|---|
| `GET /api/health` | Health check |
| `GET /api/incidents` | List incidents (filters: status, severity, terminal) |
| `GET /api/incidents/{id}` | Incident detail with events |
| `PATCH /api/incidents/{id}` | Update status/notes |
| `POST /api/voice/start` | Start voice agent call |
| `POST /api/voice/takeover/{id}` | SOC takes over call |
| `GET /api/simulation/scenarios` | List training scenarios |
| `POST /api/simulation/start` | Start simulation |
| `POST /api/simulation/end` | End simulation + get score |
| `GET /api/reports/daily/{date}` | Daily security report |
| `GET /api/reports/predictions` | Predictive risk heatmap |

## Training Scenarios

| ID | Title | Difficulty | Severity |
|---|---|---|---|
| SIM_001 | Unauthorized Airside Access | Beginner | L4 |
| SIM_002 | Unattended Baggage | Beginner | L3 |
| SIM_003 | Medical Emergency | Beginner | L3 |
| SIM_004 | Lift Breakdown | Beginner | L2 |
| SIM_005 | Aggressive Passenger | Intermediate | L3 |
| SIM_006 | Fire Alarm | Intermediate | L4 |
| SIM_007 | Suspicious Package | Advanced | L5 |
| SIM_008 | Crowd Surge | Intermediate | L3 |
| SIM_009 | Drone Intrusion | Advanced | L5 |
| SIM_010 | Active Threat | Advanced | L5 |

## Project Structure

```
aegis/
├── backend/
│   ├── api/routes/          # FastAPI route handlers
│   ├── api/websocket/       # Socket.IO manager
│   ├── config/              # Settings (pydantic-settings)
│   ├── db/                  # SQLAlchemy async session
│   ├── models/              # ORM models
│   ├── services/
│   │   ├── audio/           # PANNs, CLAP, Whisper, audio processing
│   │   ├── fusion/          # Multimodal fusion engine
│   │   ├── intelligence/    # LLM client, RAG, response engine, prompts
│   │   ├── knowledge/       # Knowledge graph, indexer
│   │   ├── reporting/       # Daily/monthly/predictive reports
│   │   ├── simulation/      # Training scenario engine
│   │   ├── video/           # Anomalib video anomaly detection
│   │   └── voice/           # Voice agent, TTS, call manager
│   └── tests/               # Pytest test suite
├── data/
│   ├── knowledge_base/      # SOPs, zones, contacts, regulations
│   └── simulations/         # 10 scenario JSON files
├── frontend/
│   └── src/
│       ├── components/      # React components (layout, panels, voice, sim, reports)
│       ├── hooks/           # useWebSocket, useIncidents, useAuth
│       ├── services/        # API client, Socket.IO service
│       ├── stores/          # Zustand stores (incidents, cameras, auth, voice)
│       └── types/           # TypeScript interfaces
└── scripts/                 # setup.sh, seed_db.py, index_knowledge.py, download_models.py
```
