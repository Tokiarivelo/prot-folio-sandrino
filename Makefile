.DEFAULT_GOAL := help
.PHONY: help install install-backend install-web install-admin \
        dev dev-backend dev-web dev-admin \
        build build-backend build-web build-admin \
        db-generate db-migrate db-seed db-studio \
        docker-build docker-up docker-down docker-dev docker-logs \
        lint lint-backend lint-web lint-admin \
        clean

# ── Colors ────────────────────────────────────────────────────────────────────
CYAN  := \033[0;36m
RESET := \033[0m

help: ## Show this help message
	@echo ""
	@echo "  $(CYAN)Portfolio Monorepo$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	  | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-22s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ── Install ───────────────────────────────────────────────────────────────────
install: install-backend install-web install-admin ## Install all dependencies

install-backend: ## Install backend dependencies (bun)
	cd backend && bun install

install-web: ## Install portfolio-web dependencies
	cd portfolio-web && npm install

install-admin: ## Install portfolio-admin dependencies
	cd portfolio-admin && npm install

# ── Dev servers ───────────────────────────────────────────────────────────────
dev: ## Start all dev servers in parallel (requires tmux or background jobs)
	@echo "Starting all services..."
	@$(MAKE) dev-backend & $(MAKE) dev-admin & wait

dev-backend: ## Start backend dev server (port 3008)
	cd backend && bun run start:dev

dev-web: ## Start portfolio-web dev server (port 4000)
	cd portfolio-web && npm run dev

dev-admin: ## Start portfolio-admin dev server (port 4201)
	cd portfolio-admin && npm run start

# ── Build ─────────────────────────────────────────────────────────────────────
build: build-backend build-web build-admin ## Build all projects

build-backend: ## Build backend
	cd backend && bun run build

build-web: ## Build portfolio-web
	cd portfolio-web && npm run build

build-admin: ## Build portfolio-admin
	cd portfolio-admin && npm run build -- --configuration=production

# ── Database ──────────────────────────────────────────────────────────────────
db-generate: ## Run prisma generate (after schema changes)
	cd backend && bun run prisma:generate

db-migrate: ## Run prisma migrate deploy (production)
	cd backend && bun run prisma:migrate

db-migrate-dev: ## Run prisma migrate dev (development — creates migration files)
	cd backend && bunx prisma migrate dev

db-seed: ## Seed the database with sample data
	cd backend && bun run prisma:seed

db-studio: ## Open Prisma Studio
	cd backend && bunx prisma studio

# ── Docker ────────────────────────────────────────────────────────────────────
docker-build: ## Build all Docker images
	docker compose build

docker-up: ## Start all services in production mode
	docker compose up -d

docker-down: ## Stop and remove containers
	docker compose down

docker-dev: ## Start all services in dev mode (hot reload)
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up

docker-logs: ## Tail logs for all containers
	docker compose logs -f

docker-logs-backend: ## Tail backend logs
	docker compose logs -f backend

docker-logs-web: ## Tail portfolio-web logs
	docker compose logs -f web

docker-logs-admin: ## Tail portfolio-admin logs
	docker compose logs -f admin

docker-restart: ## Restart all containers
	docker compose restart

docker-ps: ## Show container status
	docker compose ps

# ── Lint ──────────────────────────────────────────────────────────────────────
lint: lint-backend lint-web lint-admin ## Lint all projects

lint-backend: ## Lint backend
	cd backend && bun run lint

lint-web: ## Lint portfolio-web
	cd portfolio-web && npm run lint

lint-admin: ## Lint portfolio-admin
	cd portfolio-admin && npm run lint

# ── Utilities ─────────────────────────────────────────────────────────────────
clean: ## Remove build artifacts and node_modules
	rm -rf backend/dist backend/node_modules
	rm -rf portfolio-web/.next portfolio-web/node_modules
	rm -rf portfolio-admin/dist portfolio-admin/node_modules

env-check: ## Verify required env vars are set
	@echo "Checking environment variables..."
	@test -n "$(DATABASE_URL)"           || (echo "  MISSING: DATABASE_URL" && exit 1)
	@test -n "$(DIRECT_URL)"             || (echo "  MISSING: DIRECT_URL" && exit 1)
	@test -n "$(SUPABASE_URL)"           || (echo "  MISSING: SUPABASE_URL" && exit 1)
	@test -n "$(SUPABASE_SERVICE_ROLE_KEY)" || (echo "  MISSING: SUPABASE_SERVICE_ROLE_KEY" && exit 1)
	@test -n "$(JWT_SECRET)"             || (echo "  MISSING: JWT_SECRET" && exit 1)
	@echo "All required env vars are set."
