# Ticket-Tool — Makefile
# Voraussetzung: Docker + Docker Compose installiert
# Windows-Nutzer: Git Bash oder WSL verwenden

.PHONY: help setup dev prod stop logs migrate shell-backend \
        test lint type-check build clean reset

# Standard-Komposefilhe
DEV_FILE  := docker-compose.dev.yml
PROD_FILE := docker-compose.prod.yml

# ───────────────────────────────────────────────
# Hilfe
# ───────────────────────────────────────────────

help: ## Zeigt diese Hilfe an
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ───────────────────────────────────────────────
# Setup (einmalig)
# ───────────────────────────────────────────────

setup: ## Initialer Setup: .env anlegen + Container starten + DB migrieren
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo ""; \
		echo "✅ .env angelegt. Bitte jetzt anpassen:"; \
		echo "   - POSTGRES_PASSWORD"; \
		echo "   - SECRET_KEY  (generieren: make secret)"; \
		echo "   - FIRST_ADMIN_PASSWORD"; \
		echo ""; \
		echo "Danach: make dev"; \
	else \
		echo "⚠️  .env existiert bereits — übersprungen."; \
	fi

secret: ## Generiert einen sicheren SECRET_KEY
	@python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"

# ───────────────────────────────────────────────
# Entwicklung
# ───────────────────────────────────────────────

dev: ## Entwicklungsumgebung starten
	docker compose -f $(DEV_FILE) up -d --build
	@echo ""
	@echo "🚀 Dienste gestartet:"
	@echo "   Frontend:  http://localhost:5173"
	@echo "   API Docs:  http://localhost:8000/api/docs"

migrate: ## Datenbank-Migrationen ausführen (dev)
	docker compose -f $(DEV_FILE) exec backend alembic upgrade head

migrate-prod: ## Datenbank-Migrationen ausführen (prod)
	docker compose -f $(PROD_FILE) exec backend alembic upgrade head

stop: ## Entwicklungsumgebung stoppen
	docker compose -f $(DEV_FILE) down

logs: ## Logs aller Container streamen (dev)
	docker compose -f $(DEV_FILE) logs -f

logs-backend: ## Nur Backend-Logs (dev)
	docker compose -f $(DEV_FILE) logs -f backend

logs-frontend: ## Nur Frontend-Logs (dev)
	docker compose -f $(DEV_FILE) logs -f frontend

shell-backend: ## Shell im Backend-Container öffnen
	docker compose -f $(DEV_FILE) exec backend bash

shell-db: ## psql im Datenbank-Container öffnen
	docker compose -f $(DEV_FILE) exec db \
		psql -U $${POSTGRES_USER:-ticketuser} $${POSTGRES_DB:-ticketdb}

ps: ## Status der laufenden Container (dev)
	docker compose -f $(DEV_FILE) ps

# ───────────────────────────────────────────────
# Qualitätssicherung
# ───────────────────────────────────────────────

test: ## Backend-Tests ausführen
	docker compose -f $(DEV_FILE) exec backend \
		pytest --cov=app --cov-report=term-missing tests/

lint: ## Backend-Lint (ruff + black)
	docker compose -f $(DEV_FILE) exec backend \
		sh -c "ruff check . && black --check ."

lint-frontend: ## Frontend-Lint (eslint)
	docker compose -f $(DEV_FILE) exec frontend \
		npm run lint

type-check: ## Frontend TypeScript-Prüfung
	docker compose -f $(DEV_FILE) exec frontend \
		npm run type-check

check: lint type-check test ## Alle Prüfungen (lint + type-check + tests)

build: ## Frontend für Produktion bauen
	docker compose -f $(DEV_FILE) exec frontend npm run build

# ───────────────────────────────────────────────
# Produktion
# ───────────────────────────────────────────────

prod: ## Produktionsumgebung starten
	docker compose -f $(PROD_FILE) up -d --build
	$(MAKE) migrate-prod

prod-stop: ## Produktionsumgebung stoppen
	docker compose -f $(PROD_FILE) down

prod-logs: ## Produktions-Logs streamen
	docker compose -f $(PROD_FILE) logs -f

# ───────────────────────────────────────────────
# Backup
# ───────────────────────────────────────────────

backup: ## Manuelles Datenbank-Backup erstellen (prod)
	docker compose -f $(PROD_FILE) exec db \
		sh -c 'PGPASSWORD=$$POSTGRES_PASSWORD pg_dump -U $$POSTGRES_USER $$POSTGRES_DB' \
		| gzip > backup_$$(date +%Y%m%d_%H%M%S).sql.gz
	@echo "✅ Backup erstellt: backup_$$(date +%Y%m%d).sql.gz"

# ───────────────────────────────────────────────
# Aufräumen
# ───────────────────────────────────────────────

reset: ## ⚠️  Alles löschen: Container + Volumes (Datenverlust!)
	@read -p "Wirklich alles löschen inkl. Datenbankdaten? [y/N] " confirm; \
	if [ "$$confirm" = "y" ]; then \
		docker compose -f $(DEV_FILE) down -v --remove-orphans; \
		echo "🗑️  Alles gelöscht."; \
	else \
		echo "Abgebrochen."; \
	fi

clean: ## Docker-Images und ungenutzte Ressourcen aufräumen
	docker system prune -f
