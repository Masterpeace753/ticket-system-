# Developer Onboarding — Ticket-Tool

Willkommen im Ticket-Tool Projekt! Diese Anleitung bringt dich in 30 Minuten zum ersten lauffähigen Entwicklungsstand.

---

## Voraussetzungen

| Tool | Mindestversion | Installation |
|------|--------------|-------------|
| Docker | 24.x | https://docs.docker.com/get-docker/ |
| Docker Compose | v2.x | Inkludiert in Docker Desktop |
| Git | 2.x | https://git-scm.com/ |
| VS Code | 1.85+ | Optional, empfohlen |

Python und Node.js werden **nicht** lokal benötigt — alles läuft in Docker.  
Für IDE-Support empfohlen: Python 3.12 + Node.js 20 lokal.

---

## Lokale Einrichtung

### 1. Repository klonen

```bash
git clone https://github.com/Masterpeace753/ticket-system-.git
cd ticket-system-
```

### 2. Umgebungsvariablen

```bash
cp .env.example .env
```

Die Standardwerte in `.env` reichen für lokale Entwicklung. Für Produktion: alle Werte ersetzen.

### 3. Entwicklungsumgebung starten

```bash
docker compose -f docker-compose.dev.yml up -d
```

Warte ~30 Sekunden, bis PostgreSQL bereit ist.

### 4. Datenbank initialisieren

```bash
docker compose -f docker-compose.dev.yml exec backend alembic upgrade head
```

### 5. Öffnen

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API (Docs) | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 (user: ticketuser, db: ticketdb) |

**Erster Login**: `admin` / `changeme_admin` (aus `.env`)

---

## Projektstruktur verstehen

```
backend/app/
├── main.py          ← FastAPI App, CORS, Router-Einbindung
├── config.py        ← Settings via Pydantic (liest .env)
├── database.py      ← SQLAlchemy Engine, Session Factory
├── dependencies.py  ← get_db(), get_current_user(), require_admin()
├── models/          ← SQLAlchemy-Tabellen (User, Ticket, Comment ...)
├── schemas/         ← Pydantic In/Out-Schemas
├── routers/         ← FastAPI Endpoints (auth, tickets, users ...)
└── services/        ← Business-Logik (auth_service, ticket_service ...)
```

```
frontend/src/
├── main.ts          ← Vue-App Init, i18n, Pinia, Router
├── App.vue          ← Root Component
├── api/             ← Axios-Wrapper (NIE direktes Axios in Komponenten)
├── stores/          ← Pinia Stores (auth, tickets, categories, types)
├── views/           ← Seiten (Board, Detail, Admin, Reports, Login)
├── components/      ← Wiederverwendbare Komponenten
└── locales/         ← de.json / en.json
```

---

## Entwicklungsworkflow

### Backend-Änderung (Hot-Reload aktiv)

```bash
# Datei editieren → automatisch neu geladen
# Schemas/Modelle ändern → neue Migration erstellen:
docker compose -f docker-compose.dev.yml exec backend \
  alembic revision --autogenerate -m "beschreibung"
docker compose -f docker-compose.dev.yml exec backend \
  alembic upgrade head
```

### Frontend-Änderung (HMR aktiv)

```bash
# Einfach Datei editieren → Browser aktualisiert automatisch
```

### Tests ausführen

```bash
# Backend
docker compose -f docker-compose.dev.yml exec backend \
  pytest --cov=app tests/ -v

# Frontend
docker compose -f docker-compose.dev.yml exec frontend \
  npm run test
```

### Lint

```bash
# Backend
docker compose -f docker-compose.dev.yml exec backend sh -c \
  "ruff check . && black --check ."

# Frontend
docker compose -f docker-compose.dev.yml exec frontend npm run lint
```

---

## API-Nutzung

Die interaktive API-Dokumentation ist unter http://localhost:8000/docs verfügbar (Swagger UI).

**Authentifizierung in Swagger:**
1. `POST /api/auth/login` mit `username` + `password`
2. JWT-Token kopieren
3. "Authorize" → `Bearer <token>` einfügen

---

## Konventionen

### Backend

- **Business-Logik nur in `services/`** — Router ruft nur Service-Funktionen auf
- **Audit-Log**: Jede Ticket-Mutation via `audit_service.log_change()` loggen
- **Fehlerbehandlung**: `HTTPException` mit klaren Status-Codes
- **Type Hints**: Überall, für alle Funktionen
- **Schemas**: Getrennte `CreateSchema`, `UpdateSchema`, `ResponseSchema`

### Frontend

- **Kein direktes Axios** in Komponenten — immer über `src/api/*.ts`
- **Kein hardcodierter Text** — immer `$t('key')` / `useI18n`
- **`<script setup lang="ts">`** überall
- **Pinia für State** — kein `this.$store`, kein Vuex

---

## Wichtige Businessregeln

1. **Ticketstatus**: `neu` → `zugewiesen` → `in_bearbeitung` → `wartet_auf_rueckmeldung` → `erledigt`
2. **Archivierung**: Wenn Status → `erledigt`, wird `is_archived = true` automatisch gesetzt
3. **Kommentare**: Nur hinzufügen (append-only). Kein Bearbeiten, kein Löschen.
4. **Audit-Log**: Jede Feldänderung am Ticket wird geloggt (Feldname, alter Wert, neuer Wert, User, Zeitstempel)

---

## Häufige Probleme

**Backend startet nicht:**
```bash
docker compose -f docker-compose.dev.yml logs backend
# Oft: DB noch nicht bereit → nochmal warten oder:
docker compose -f docker-compose.dev.yml restart backend
```

**Alembic Migration schlägt fehl:**
```bash
# Status prüfen:
docker compose -f docker-compose.dev.yml exec backend alembic current
# Heads prüfen:
docker compose -f docker-compose.dev.yml exec backend alembic heads
```

**Port belegt:**
```bash
# Ports 5432, 8000, 5173 müssen frei sein
# Windows:
netstat -ano | findstr :5432
```

---

## Nächste Schritte

1. `README.md` vollständig lesen
2. [Architekturplan](architecture/architecture-plan.md) anschauen
3. [Implementierungsplan](../plan/implementation-plan.md) für aktuellen Stand lesen
4. Erste Aufgabe aus [Projektroadmap](../plan/project-roadmap.md) nehmen
