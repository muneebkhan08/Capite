.PHONY: dev build start stop test lint clean setup dev-frontend dev-backend dev-docker test-backend test-frontend logs typecheck

# Development (requires Node.js + Python installed locally)
dev:
	@echo "Starting development servers..."
	@make -j2 dev-frontend dev-backend

dev-frontend:
	cd frontend && DATABASE_URL="file:./data/captions.db" npm run dev

dev-backend:
	cd backend && source .venv/bin/activate && python app.py

# Docker
build:
	docker compose build

start:
	docker compose up -d

stop:
	docker compose down

logs:
	docker compose logs -f

# Docker development (with hot reload)
dev-docker:
	docker compose -f docker-compose.dev.yml up --build

# Testing
test:
	cd backend && PYTHONPATH=. python -m pytest tests/ -v

test-backend:
	cd backend && PYTHONPATH=. python -m pytest tests/ -v

# Code quality
lint:
	cd frontend && npm run lint
	cd backend && python -m flake8 app.py caption_job.py caption_styles.py subtitles.py subtitle_utils.py job_storage.py --max-line-length 120

typecheck:
	cd frontend && npm run build

# Setup (first time)
setup:
	cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
	cd frontend && npm install && DATABASE_URL="file:./data/captions.db" npx prisma generate && DATABASE_URL="file:./data/captions.db" npx prisma db push

# Clean
clean:
	rm -rf backend/data/temp/* backend/data/output/*
	rm -rf frontend/.next frontend/node_modules backend/__pycache__ backend/.venv
