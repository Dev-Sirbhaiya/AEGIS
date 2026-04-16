# AEGIS - Engineering Specification

**Version:** 2.0
**Date:** 2026-04-17
**Baseline:** Current shipped state on `main`

---

## 1. Purpose

This document describes the current implementation shape of AEGIS as it exists on the latest `main` branch. It is meant to stay aligned with the shipped codebase, not with older aspirational build notes.

---

## 2. Repository Layout

```text
C:\AEGIS\aegis
|- AEGIS_SPEC.md
|- PRD_AEGIS.md
`- aegis/
   |- README.md
   |- backend/
   |- data/
   |- docs/
   |- frontend/
   |- scripts/
   |- docker-compose.yml
   `- nginx.conf
```

The git repo root is `C:\AEGIS\aegis`.
The application root is `C:\AEGIS\aegis\aegis`.

---

## 3. Runtime Modes

### 3.1 Recommended Local Development Mode

Use:

- local backend from `backend`
- local frontend from `frontend`
- SQLite for local development
- Groq or Ollama for the LLM

### 3.2 Optional Container Mode

Docker Compose remains available for full-stack runs with PostgreSQL, Redis, frontend, backend, and nginx.

---

## 4. Environment Files

There are two environment file locations in current use:

- local backend run: `aegis/backend/.env`
- Docker Compose run: `aegis/.env`

The local backend reads `backend/.env` because settings use `env_file = ".env"` relative to the backend working directory.

---

## 5. Ports and Entry Points

### 5.1 Local Development

- backend: `uvicorn main:app --host 0.0.0.0 --port 8001 --reload`
- frontend: `npm.cmd run dev`
- frontend URL: `http://localhost:5173`

### 5.2 Frontend Proxy

Vite proxies these paths to `http://localhost:8001`:

- `/api`
- `/socket.io`
- `/media`

### 5.3 Docker

- backend container: `8000`
- frontend container: `3000`
- nginx public entry: `80`

### 5.4 Correct Backend Object

Use:

```text
main:app
```

Do not use the older:

```text
main:socket_app
```

---

## 6. Backend Stack

Current backend technologies:

- FastAPI
- Python-SocketIO
- SQLAlchemy
- SQLite for local development
- PostgreSQL for containerized runs
- Redis
- ChromaDB
- sentence-transformers
- Whisper
- PANNs
- CLAP
- Anomalib
- Edge TTS / Kokoro

### 6.1 Main Backend Modules

- `api/routes`
- `api/websocket`
- `config`
- `db`
- `models`
- `services/audio`
- `services/fusion`
- `services/intelligence`
- `services/knowledge`
- `services/reporting`
- `services/simulation`
- `services/video`
- `services/voice`

---

## 7. Frontend Stack

Current frontend technologies:

- React 18
- Vite
- TypeScript
- Tailwind CSS
- Zustand
- Socket.IO client
- Recharts

### 7.1 Current Routes

- `/login`
- `/`
- `/training`
- `/reports`

### 7.2 Current UI Direction

The shipped interface is now:

- readability-first
- light-themed
- operator-focused

It no longer follows the older dark cinematic concept.

### 7.3 Typography System

- primary UI font: `Public Sans`
- data font: `JetBrains Mono`

### 7.4 Layout Notes

- the homepage/dashboard uses user-controlled scrolling
- training and reports are also built for readable long-form scanning

---

## 8. Real-Time Model

Current websocket behavior includes:

- incident subscriptions
- simulation event streaming
- incident action acknowledgement broadcasting

Important emitted/listened events in the current system include:

- `subscribe_incidents`
- `subscribe_voice`
- `subscribe_camera`
- `subscribe_simulation`
- `simulation:event`
- `incident:action_taken`
- `action:incident`

---

## 9. Simulation Behavior

The training system currently:

- loads authored scenarios from disk
- starts a session
- streams events over time
- records officer actions
- calculates a score
- generates a debrief

### 9.1 Current Demo Cadence

For the current main branch, training timelines are compressed for live demos:

- first event: immediate
- subsequent events: 3, 4, 5 second repeating cadence

This applies to the simulator experience used in demos and judging.

---

## 10. Reporting Behavior

The reporting layer currently exposes:

- daily reports
- monthly reports
- predictive reporting/risk visualization

These views are part of the main product shell and are intended to support supervisor and presentation workflows.

---

## 11. Demo Reliability Strategy

The current implementation intentionally includes demo-safe behavior:

- local-friendly development flow
- fallback behavior for partial backend or service degradation
- seeded demo data
- a training mode that completes quickly enough for a live presentation

---

## 12. Current Boundaries

This implementation should be described honestly:

- it is human-in-the-loop decision support
- it includes agentic elements, especially in voice and guided flows
- it is not a fully autonomous operational command system

---

## 13. Documentation Rules

Future docs should remain aligned to the current codebase by:

- documenting local development first
- treating Docker as optional for local work
- using `main:app`
- using backend port `8001` for local frontend development
- describing the UI as readable and operator-centric
- mentioning the faster 3 to 5 second simulator event cadence when discussing training/demo behavior
