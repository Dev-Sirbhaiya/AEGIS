.PHONY: setup run dev test index seed clean

# Full setup: install deps, start infra, index knowledge, seed DB
setup:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install
	docker compose up -d postgres redis
	sleep 3
	cd backend && python ../scripts/index_knowledge.py
	cd backend && python ../scripts/seed_db.py

# Start all services via Docker Compose
run:
	docker compose up --build

# Development mode: run backend + frontend separately
dev:
	@echo "Starting backend..."
	cd backend && uvicorn main:socket_app --host 0.0.0.0 --port 8000 --reload &
	@echo "Starting frontend..."
	cd frontend && npm run dev

# Run tests
test:
	cd backend && pytest tests/ -v

# Index knowledge base into ChromaDB
index:
	cd backend && python ../scripts/index_knowledge.py

# Seed database with demo data
seed:
	cd backend && python ../scripts/seed_db.py

# Clean generated files
clean:
	rm -rf data/chroma/*
	rm -rf models/anomalib/*.ckpt
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
