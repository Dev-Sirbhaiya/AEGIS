#!/usr/bin/env bash
# AEGIS Setup Script
# Installs dependencies, starts infrastructure, and seeds the database.
# Run from the aegis/ directory: bash scripts/setup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== AEGIS Setup ==="
echo "Root: $ROOT_DIR"

# 1. Create Python virtual environment
echo ""
echo "[1/6] Creating Python virtual environment..."
cd "$ROOT_DIR/backend"
python -m venv .venv 2>/dev/null || true
source .venv/bin/activate 2>/dev/null || source .venv/Scripts/activate

# 2. Install backend dependencies
echo ""
echo "[2/6] Installing backend dependencies..."
pip install -r requirements.txt --quiet

# 3. Install frontend dependencies
echo ""
echo "[3/6] Installing frontend dependencies..."
cd "$ROOT_DIR/frontend"
npm install --silent

# 4. Start infrastructure
echo ""
echo "[4/6] Starting PostgreSQL and Redis via Docker Compose..."
cd "$ROOT_DIR"
docker compose up -d postgres redis
sleep 3  # Wait for containers to be ready

# 5. Index knowledge base
echo ""
echo "[5/6] Indexing knowledge base..."
cd "$ROOT_DIR/backend"
source .venv/bin/activate 2>/dev/null || source .venv/Scripts/activate
python ../scripts/index_knowledge.py

# 6. Seed database
echo ""
echo "[6/6] Seeding database with demo data..."
python ../scripts/seed_db.py

echo ""
echo "=== AEGIS Setup Complete ==="
echo ""
echo "To start AEGIS:"
echo "  Backend:  cd backend && uvicorn main:socket_app --host 0.0.0.0 --port 8000 --reload"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "Then open http://localhost:5173"
echo "Login: admin / admin"
