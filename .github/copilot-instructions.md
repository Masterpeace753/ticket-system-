# Ticket-Tool — Copilot Instructions

## Project Context

This is **Ticket-Tool**, an internal Kanban-based task management MVP built for a small team.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3 + TypeScript + Vite + Pinia + Vue Router 4 |
| Styling | Tailwind CSS |
| Drag & Drop | vue-draggable-next |
| i18n | vue-i18n |
| HTTP Client | Axios |
| Backend | Python 3.12 + FastAPI |
| ORM | SQLAlchemy 2.0 (async) + Alembic |
| Auth | python-jose (JWT HS256) + passlib[bcrypt] |
| Validation | Pydantic v2 |
| Database | PostgreSQL 16 |
| Proxy | Nginx (TLS termination) |
| Container | Docker + Docker Compose |

### Project Structure

- `backend/app/` — FastAPI application
  - `models/` — SQLAlchemy models
  - `schemas/` — Pydantic v2 schemas
  - `routers/` — FastAPI routers (one per domain)
  - `services/` — Business logic layer
  - `dependencies.py` — Shared FastAPI dependencies
- `frontend/src/` — Vue 3 SPA
  - `views/` — Page-level components
  - `components/` — Reusable UI components
  - `stores/` — Pinia stores
  - `api/` — Axios API wrappers
  - `locales/` — i18n translation files (de/en)
- `nginx/` — Nginx configuration + certs
- `backup/` — Backup scripts

### Patterns and Conventions

- **Backend**: Service Layer between Router and Repository; never put business logic in routers
- **Backend**: All routes require authentication via `get_current_user` dependency; admin routes additionally require `require_admin`
- **Backend**: Write audit entries via `audit_service.log_change()` for every ticket mutation
- **Frontend**: All API interactions go through `src/api/*.ts` files, never call axios directly in components
- **Frontend**: All UI text goes through `$t()` / `useI18n()` — no hardcoded strings
- **Frontend**: Use `<script setup lang="ts">` syntax throughout
- **Auth**: JWT access tokens; store in Pinia `auth.ts`, attach via Axios request interceptor
- **Security**: Never commit `.env` files; use `.env.example` as template

### Key Business Rules

- Ticket statuses: `neu` → `zugewiesen` → `in_bearbeitung` → `wartet_auf_rueckmeldung` → `erledigt`
- Setting status to `erledigt` automatically sets `is_archived = true`
- Comments are append-only: no edit or delete
- Audit trail: every field change on a ticket must be logged to `audit_log` table
- Passwords: bcrypt with cost factor 12

### API Base URL

`/api/` (proxied by Nginx in production, Vite proxy in dev)

### Test Commands

```bash
# Backend
cd backend && pytest --cov=app tests/

# Frontend
cd frontend && npm run type-check && npm run test
```

### Lint Commands

```bash
# Backend
cd backend && ruff check . && black --check .

# Frontend
cd frontend && npm run lint
```
