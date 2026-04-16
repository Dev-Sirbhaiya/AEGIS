# AEGIS - Adaptive Engagement & Guided Intelligence for Security

AEGIS is a multimodal security response advisor built for airport Security Operations Centres, with the current implementation tailored to the NAISC 2026 Certis challenge use case.

It combines CCTV, audio, access-control, and sensor context into a single operator workflow, then uses retrieval-augmented intelligence plus an LLM to explain incidents, recommend proportionate actions, support emergency-call triage, run training simulations, and generate intelligence reports.

## What Ships on the Current Main Branch

- A React SOC dashboard for live incident triage
- A login flow with `admin / admin` after database seeding
- Real-time Socket.IO updates for incidents, simulation events, and incident action acknowledgements
- A voice workflow for emergency/intercom calls
- A training simulator with accelerated event playback on a 3 to 5 second cadence
- Daily, monthly, and predictive report views
- Demo-safe frontend and backend fallbacks for offline or partial-demo conditions
- A readability-first operator UI using `Public Sans` for interface text and `JetBrains Mono` for data
- User-controlled homepage scrolling instead of a clipped fixed-height dashboard shell

## Current Product Direction

The current frontend is no longer the older dark, cinematic concept from early design notes. The shipped UI on `main` is optimized for operator readability and live-demo reliability:

- lighter surfaces
- stronger text contrast
- cleaner input and button primitives
- simpler navigation
- clearer training and report screens

## Architecture

```text
[CCTV / Audio / Sensors / Access Logs]
                |
                v
     Multimodal Fusion + Correlation
                |
                v
   RAG Pipeline (ChromaDB + MiniLM)
                |
                v
   LLM Response Engine (provider-configurable)
                |
                v
   React SOC Dashboard + Voice + Simulation + Reports
```

## Core Capabilities

### 1. Incident Triage Dashboard

- incident list with severity and modality context
- live camera/media viewing
- AI-generated situation assessment
- prioritized recommended actions
- incident action acknowledgement broadcasts over Socket.IO

### 2. Voice Triage Workflow

- emergency/intercom call handling
- transcription with Whisper
- LLM-guided response generation
- operator handoff support

### 3. Training Simulator

- scenario-driven officer training
- live event feed playback
- action capture and scoring
- automated debrief generation
- accelerated event cadence for demos and judging sessions

### 4. Reporting

- daily summary view
- monthly trend view
- predictive hotspot/risk view

## Model and Service Stack

| Area | Current stack |
|---|---|
| Backend | FastAPI + Python-SocketIO |
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Local database | SQLite via `aiosqlite` |
| Container database | PostgreSQL 16 |
| Cache/events | Redis 7 |
| Video detection | Anomalib (`efficient_ad`) |
| Audio detection | PANNs + CLAP |
| Speech-to-text | Whisper |
| Embeddings | `sentence-transformers/all-MiniLM-L6-v2` |
| Vector store | ChromaDB |
| LLM providers | Groq, OpenAI, Claude, Ollama |
| TTS | Edge TTS / Kokoro |

## Recommended Local Run Path

The easiest and most reliable local setup on Windows is:

1. run the backend locally from `backend`
2. run the frontend locally from `frontend`
3. use SQLite for local development
4. use Groq or Ollama for the LLM

This avoids Docker during active development.

Detailed instructions live in:

- `docs/HOW_TO_RUN.md`

### Important Runtime Notes

- Local backend entrypoint: `uvicorn main:app`
- Local backend port for frontend dev: `8001`
- Frontend dev server: `5173`
- Local backend reads `backend/.env`
- Docker Compose reads the root `.env`

## Quick Start

### 1. Add your API key

For local development, create `backend/.env`.

Example for Groq:

```env
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=sqlite+aiosqlite:///./aegis_dev.db
REDIS_URL=
```

Example for Ollama:

```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=your_installed_ollama_model
DATABASE_URL=sqlite+aiosqlite:///./aegis_dev.db
REDIS_URL=
```

### 2. Set up the backend

```powershell
cd C:\AEGIS\aegis\aegis\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 3. Set up the frontend

```powershell
cd C:\AEGIS\aegis\aegis\frontend
npm.cmd install
```

### 4. Index knowledge and seed demo data

```powershell
cd C:\AEGIS\aegis\aegis\backend
.\.venv\Scripts\Activate.ps1
python ..\scripts\index_knowledge.py
python ..\scripts\seed_db.py
```

Default login after seeding:

```text
username: admin
password: admin
```

### 5. Run the backend

```powershell
cd C:\AEGIS\aegis\aegis\backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### 6. Run the frontend

```powershell
cd C:\AEGIS\aegis\aegis\frontend
npm.cmd run dev
```

Open:

- `http://localhost:5173`
- `http://localhost:5173/training`
- `http://localhost:5173/reports`

## Optional Docker Path

Docker is still supported, but it is no longer the recommended development path on Windows.

When using Docker Compose:

- set values in the root `.env`
- backend runs inside the container on `8000`
- frontend container is exposed on `3000`
- nginx serves the app on `http://localhost`

Start it with:

```powershell
cd C:\AEGIS\aegis\aegis
docker compose up --build
```

## API Surface

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | backend health check |
| `POST /api/auth/login` | login |
| `GET /api/incidents/` | list incidents |
| `GET /api/cameras/` | list cameras |
| `GET /api/media/videos/{camera_id}` | camera demo video mapping |
| `POST /api/voice/start` | start voice workflow |
| `POST /api/simulation/start` | start training session |
| `POST /api/simulation/end` | end session and score |
| `GET /api/reports/daily/{date}` | daily report |
| `GET /api/reports/monthly/{year}/{month}` | monthly report |
| `GET /api/reports/predictive` | predictive report data |

## Frontend Routes

| Route | View |
|---|---|
| `/login` | login and demo mode entry |
| `/` | SOC dashboard |
| `/training` | training simulator |
| `/reports` | report views |

## Project Structure

```text
aegis/
|- backend/
|  |- api/
|  |- config/
|  |- db/
|  |- models/
|  |- services/
|  `- tests/
|- data/
|  |- demo/
|  |- knowledge_base/
|  `- simulations/
|- docs/
|- frontend/
|  `- src/
|- nginx.conf
`- scripts/
```

## Notes for Judges, Reviewers, and Teammates

- The app is human-in-the-loop decision support, not a fully autonomous response system
- Local fallback/demo behavior is intentional and helps keep the experience stable during demos
- The training feed is intentionally faster than authored scenario timings so the full flow fits a live presentation window

## Additional Documentation

- `docs/HOW_TO_RUN.md`
- `../PRD_AEGIS.md`
- `../AEGIS_SPEC.md`
