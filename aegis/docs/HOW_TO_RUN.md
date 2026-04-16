# AEGIS Run Guide

This guide explains how to set up and run AEGIS on Windows using PowerShell.

Project root used in this guide:

```powershell
C:\AEGIS\aegis\aegis
```

## Recommended Path

For local development on Windows, the easiest path is:

1. Run the backend locally with a Python virtual environment
2. Run the frontend locally with Vite
3. Use SQLite locally instead of PostgreSQL
4. Use Groq or Ollama for the LLM

This avoids Docker during development.

## Important: There Are Two `.env` Files

AEGIS currently uses two different `.env` locations depending on how you run it:

- Local backend run: `C:\AEGIS\aegis\aegis\backend\.env`
- Docker Compose run: `C:\AEGIS\aegis\aegis\.env`

If you start the backend with:

```powershell
cd C:\AEGIS\aegis\aegis\backend
uvicorn main:app ...
```

then the backend reads `backend\.env`.

If you run:

```powershell
docker compose up --build
```

then Docker Compose reads the root `.env`.

## 1. Add Your API Key

### Option A: Groq (recommended)

Groq is the simplest hosted option for this project.

From the project root:

```powershell
cd C:\AEGIS\aegis\aegis
Copy-Item .env.example backend\.env
notepad backend\.env
```

Then set at least these lines:

```env
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=sqlite+aiosqlite:///./aegis_dev.db
REDIS_URL=
```

Notes:

- `DATABASE_URL=sqlite+aiosqlite:///./aegis_dev.db` is the easiest local setup
- `REDIS_URL=` can be left empty for local development
- SQLite database file will be created in `backend\aegis_dev.db`

### Option B: Ollama (local LLM)

If you want to use a local model through Ollama:

```powershell
cd C:\AEGIS\aegis\aegis
Copy-Item .env.example backend\.env
notepad backend\.env
```

Set:

```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=your_installed_ollama_model
DATABASE_URL=sqlite+aiosqlite:///./aegis_dev.db
REDIS_URL=
```

Example model names depend on what you already pulled into Ollama.

### If You Do Not Add an API Key

The backend will still start. The LLM client falls back to a mock response mode instead of crashing.

## 2. Set Up the Backend

Open PowerShell and run:

```powershell
cd C:\AEGIS\aegis\aegis\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

If PowerShell blocks the activation script, run:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\.venv\Scripts\Activate.ps1
```

Notes:

- The backend dependencies are heavy because they include PyTorch, Whisper, Anomalib, and audio libraries
- First install can take a while

## 3. Set Up the Frontend

In another PowerShell window:

```powershell
cd C:\AEGIS\aegis\aegis\frontend
npm.cmd install
```

## 4. Index the Knowledge Base and Seed Demo Data

This step is recommended so the dashboard has demo content and the RAG pipeline has indexed material.

From the backend folder with the virtual environment activated:

```powershell
cd C:\AEGIS\aegis\aegis\backend
.\.venv\Scripts\Activate.ps1
python ..\scripts\index_knowledge.py
python ..\scripts\seed_db.py
```

What this does:

- `index_knowledge.py` indexes the documents in `data\knowledge_base`
- `seed_db.py` creates demo incidents and the default admin user

Default login after seeding:

```text
username: admin
password: admin
```

## 5. Run the App Locally

### Terminal 1: Backend

Run the backend on port `8001`.

This is important because the frontend Vite proxy is currently configured to call `http://localhost:8001`.

```powershell
cd C:\AEGIS\aegis\aegis\backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### Terminal 2: Frontend

```powershell
cd C:\AEGIS\aegis\aegis\frontend
npm.cmd run dev
```

### Open the App

Open:

- `http://localhost:5173`

Useful pages:

- Dashboard: `http://localhost:5173/`
- Training: `http://localhost:5173/training`
- Reports: `http://localhost:5173/reports`

Backend checks:

- Health: `http://127.0.0.1:8001/api/health`
- API docs: `http://127.0.0.1:8001/docs`

## 6. Optional: Run with Docker Compose

Use this only if Docker Desktop is healthy on your machine.

### Set the Docker `.env`

Docker Compose uses the root `.env`, not `backend\.env`.

```powershell
cd C:\AEGIS\aegis\aegis
Copy-Item .env.example .env
notepad .env
```

For Groq:

```env
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
```

For Ollama from Docker:

```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://host.docker.internal:11434/v1
OLLAMA_MODEL=your_installed_ollama_model
```

### Start Docker

```powershell
cd C:\AEGIS\aegis\aegis
docker compose up --build
```

Open:

- Main app through nginx: `http://localhost`
- Frontend container: `http://localhost:3000`
- Backend health: `http://localhost:8000/api/health`

## 7. Common Gotchas

### Use `main:app`, not `main:socket_app`

If you see older commands in old notes or scripts, do not use:

```powershell
uvicorn main:socket_app ...
```

Use:

```powershell
uvicorn main:app ...
```

### Local frontend expects backend on `8001`

The Vite dev server currently proxies `/api`, `/socket.io`, and `/media` to:

```text
http://localhost:8001
```

So for local development, start the backend on `8001` unless you also change `frontend\vite.config.ts`.

### `scripts\setup.sh` is not the best Windows path

There is a `scripts\setup.sh`, but it is bash-oriented and contains older startup references. On Windows, use the manual steps in this guide instead.

### First run may be slow

On first startup, the backend may:

- create the SQLite database
- create the default admin user
- load Whisper
- load sentence-transformers
- load the knowledge graph

That is normal.

## 8. Quick Start Summary

If you want the shortest working path:

### One-time setup

```powershell
cd C:\AEGIS\aegis\aegis
Copy-Item .env.example backend\.env
notepad backend\.env
```

Put in:

```env
LLM_PROVIDER=groq
GROQ_API_KEY=your_key_here
DATABASE_URL=sqlite+aiosqlite:///./aegis_dev.db
REDIS_URL=
```

Then:

```powershell
cd C:\AEGIS\aegis\aegis\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python ..\scripts\index_knowledge.py
python ..\scripts\seed_db.py
```

```powershell
cd C:\AEGIS\aegis\aegis\frontend
npm.cmd install
```

### Every time you want to run it

Backend:

```powershell
cd C:\AEGIS\aegis\aegis\backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Frontend:

```powershell
cd C:\AEGIS\aegis\aegis\frontend
npm.cmd run dev
```

Then open:

```text
http://localhost:5173
```
