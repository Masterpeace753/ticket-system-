---
goal: "Ticket-Tool MVP — Detaillierter Implementierungsplan"
version: "1.0"
date_created: "2026-04-18"
status: "Planned"
tags: [feature, implementation, mvp]
---

# Ticket-Tool MVP — Implementierungsplan

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

**Agent**: implementation-plan + principal-software-engineer + repo-architect

---

## 1. Requirements & Constraints

- **REQ-001**: Kanban-Board als Hauptansicht mit Spalten Neu/Zugewiesen/In Bearbeitung/Warten auf Rückmeldung/Erledigt
- **REQ-002**: Ticket-Pflichtfelder: Titel, Beschreibung, Verantwortlicher, Priorität, Kategorie, Typ, Fälligkeitsdatum
- **REQ-003**: Automatisches Archivieren bei Status "Erledigt"
- **REQ-004**: Kommentare: hinzufügen, nicht editierbar/löschbar
- **REQ-005**: Volltext-Suche (Titel, ID, Beschreibung) + Filter
- **REQ-006**: Reporting: nach Status, Verantwortlichem, Priorität, Kategorie/Typ
- **REQ-007**: Admin-Bereich: User, Kategorien, Typen verwalten
- **REQ-008**: DE/EN Sprachumschaltung
- **REQ-009**: Login per Username/Passwort (bcrypt, JWT)
- **REQ-010**: Docker-Deployment (Compose), HTTPS intern
- **REQ-011**: Wöchentliches Backup (4 Generationen)
- **REQ-012**: Audit Light — "Zuletzt geändert von X am …"
- **SEC-001**: Passwort-Hashing bcrypt (cost 12)
- **SEC-002**: JWT HS256, 60 Min Laufzeit
- **SEC-003**: Kein externer Zugriff, nur VPN/intern
- **CON-001**: Kein Mobile-Support im MVP
- **CON-002**: Keine externe API-Integration im MVP
- **PAT-001**: Repository-Pattern für Datenbankzugriff
- **PAT-002**: Service-Layer zwischen Router und Repository

---

## 2. Repository-Struktur

```
ticket-tool/
├── .github/
│   ├── copilot/                    # Copilot Agents (bereits vorhanden)
│   ├── copilot-instructions.md     # Projekt-spezifische Copilot-Regeln
│   └── workflows/
│       ├── ci.yml                  # Lint, Test, Build
│       └── cd.yml                  # Deploy (manuell trigger)
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI App Entry Point
│   │   ├── config.py               # Settings via pydantic-settings
│   │   ├── database.py             # SQLAlchemy Engine + Session
│   │   ├── dependencies.py         # FastAPI Dependencies (get_db, get_current_user)
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py             # User SQLAlchemy Model
│   │   │   ├── ticket.py           # Ticket SQLAlchemy Model
│   │   │   ├── comment.py          # Comment SQLAlchemy Model
│   │   │   ├── category.py         # Category SQLAlchemy Model
│   │   │   ├── type.py             # Type SQLAlchemy Model
│   │   │   └── audit_log.py        # AuditLog SQLAlchemy Model
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py             # Pydantic Schemas User
│   │   │   ├── ticket.py           # Pydantic Schemas Ticket
│   │   │   ├── comment.py          # Pydantic Schemas Comment
│   │   │   ├── category.py         # Pydantic Schemas Category
│   │   │   ├── type.py             # Pydantic Schemas Type
│   │   │   └── auth.py             # LoginRequest, TokenResponse
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py             # POST /auth/login, /auth/me
│   │   │   ├── tickets.py          # CRUD + status + assign
│   │   │   ├── comments.py         # GET/POST comments
│   │   │   ├── users.py            # Admin: user management
│   │   │   ├── categories.py       # Admin: category management
│   │   │   ├── types.py            # Admin: type management
│   │   │   └── reports.py          # GET /reports/*
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── auth_service.py     # JWT erstellen/prüfen, bcrypt
│   │       ├── ticket_service.py   # Business-Logik Tickets
│   │       ├── user_service.py     # Business-Logik User
│   │       └── audit_service.py    # Audit-Log schreiben
│   ├── alembic/
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   │       └── 001_initial_schema.py
│   ├── tests/
│   │   ├── conftest.py             # pytest fixtures, test DB
│   │   ├── test_auth.py
│   │   ├── test_tickets.py
│   │   ├── test_users.py
│   │   └── test_reports.py
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── alembic.ini
├── frontend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── App.vue
│   │   ├── router/
│   │   │   └── index.ts            # Vue Router (Board, Detail, Admin, Login)
│   │   ├── stores/
│   │   │   ├── auth.ts             # Pinia: JWT, User
│   │   │   ├── tickets.ts          # Pinia: Ticket-State, Filter
│   │   │   ├── categories.ts       # Pinia: Categories
│   │   │   └── types.ts            # Pinia: Types
│   │   ├── api/
│   │   │   ├── axios.ts            # Axios Instance + Interceptors
│   │   │   ├── tickets.ts          # API-Calls Tickets
│   │   │   ├── auth.ts             # API-Calls Auth
│   │   │   ├── users.ts            # API-Calls Users
│   │   │   ├── categories.ts       # API-Calls Categories
│   │   │   ├── types.ts            # API-Calls Types
│   │   │   └── reports.ts          # API-Calls Reports
│   │   ├── views/
│   │   │   ├── LoginView.vue
│   │   │   ├── BoardView.vue       # Kanban-Hauptansicht
│   │   │   ├── TicketDetailView.vue
│   │   │   ├── ReportView.vue
│   │   │   └── admin/
│   │   │       ├── AdminView.vue
│   │   │       ├── UserManagement.vue
│   │   │       ├── CategoryManagement.vue
│   │   │       └── TypeManagement.vue
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppHeader.vue
│   │   │   │   └── AppSidebar.vue
│   │   │   ├── board/
│   │   │   │   ├── KanbanColumn.vue
│   │   │   │   └── TicketCard.vue
│   │   │   ├── ticket/
│   │   │   │   ├── TicketForm.vue
│   │   │   │   └── CommentSection.vue
│   │   │   ├── shared/
│   │   │   │   ├── FilterBar.vue
│   │   │   │   ├── ConfirmDialog.vue
│   │   │   │   └── LoadingSpinner.vue
│   │   │   └── admin/
│   │   │       └── DataTable.vue
│   │   ├── locales/
│   │   │   ├── de.json
│   │   │   └── en.json
│   │   └── types/
│   │       └── index.ts            # TypeScript Interfaces
│   ├── public/
│   ├── index.html
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── nginx/
│   ├── nginx.conf
│   └── certs/                      # .gitignored: SSL-Zertifikate
├── backup/
│   └── backup.sh                   # pg_dump + Rotation
├── docs/
│   ├── architecture/
│   │   ├── architecture-plan.md    # Dieses Dokument
│   │   └── adr/
│   │       ├── ADR-001-vue3.md
│   │       ├── ADR-002-fastapi.md
│   │       ├── ADR-003-postgresql.md
│   │       ├── ADR-004-monolith.md
│   │       └── ADR-005-jwt.md
│   ├── security/
│   │   └── security-review.md
│   └── onboarding.md
├── plan/
│   ├── project-roadmap.md
│   └── implementation-plan.md      # Dieses Dokument
├── .env.example                    # Template für Umgebungsvariablen
├── .gitignore
├── docker-compose.dev.yml
├── docker-compose.prod.yml
└── README.md
```

---

## 3. Implementierungsschritte

### Phase 1: Foundation

#### GOAL-001: Basis-Setup und Projektstruktur

| Task | Beschreibung | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Verzeichnisstruktur anlegen (alle Ordner gemäß Struktur oben) | | |
| TASK-002 | `backend/requirements.txt` erstellen (fastapi, uvicorn, sqlalchemy, alembic, python-jose, passlib, psycopg2-binary, pydantic-settings) | | |
| TASK-003 | `backend/requirements-dev.txt` (pytest, pytest-asyncio, httpx, black, ruff) | | |
| TASK-004 | `frontend/package.json` mit Vue3, Vite, Pinia, Router, Axios, vue-draggable-next, vue-i18n, Tailwind | | |
| TASK-005 | `.env.example` mit allen Keys (DB_URL, SECRET_KEY, etc.) | | |
| TASK-006 | `.gitignore` (venv, node_modules, .env, certs/) | | |

#### GOAL-002: Datenbankmodelle & Alembic

| Task | Beschreibung | Completed | Date |
|------|-------------|-----------|------|
| TASK-010 | `backend/app/models/user.py` — User-Modell (UserID, Username, PasswordHash, DisplayName, Email, IsActive, IsAdmin) | | |
| TASK-011 | `backend/app/models/ticket.py` — Ticket-Modell (alle Felder lt. ER-Modell, Status als Enum, IsArchived) | | |
| TASK-012 | `backend/app/models/comment.py` — Comment-Modell (CommentID, TicketID FK, UserID FK, Text, CreatedAt) | | |
| TASK-013 | `backend/app/models/category.py` — Category-Modell | | |
| TASK-014 | `backend/app/models/type.py` — Type-Modell | | |
| TASK-015 | `backend/app/models/audit_log.py` — AuditLog-Modell (FieldName, OldValue, NewValue) | | |
| TASK-016 | `backend/alembic/versions/001_initial_schema.py` — Initiale Migration | | |
| TASK-017 | DB-Indizes: `tickets.status`, `tickets.assignedToUserID`, `tickets.dueDate`, `audit_log.ticketID` | | |

#### GOAL-003: Authentifizierung

| Task | Beschreibung | Completed | Date |
|------|-------------|-----------|------|
| TASK-020 | `backend/app/services/auth_service.py` — `hash_password()`, `verify_password()`, `create_access_token()`, `decode_token()` | | |
| TASK-021 | `backend/app/routers/auth.py` — `POST /api/auth/login` (returns JWT), `GET /api/auth/me` | | |
| TASK-022 | `backend/app/dependencies.py` — `get_current_user()` Dependency, `require_admin()` Dependency | | |
| TASK-023 | Admin-Seed: Initial-User via `alembic` Data-Migration oder `backend/app/initial_data.py` | | |

---

### Phase 2: Core Backend

#### GOAL-004: Ticket API

| Task | Beschreibung | Completed | Date |
|------|-------------|-----------|------|
| TASK-030 | `GET /api/tickets` — Liste mit Pagination, Filter (status, priority, assignee, category, type, dueDate), Volltext-Suche | | |
| TASK-031 | `POST /api/tickets` — Ticket erstellen (Pflichtfelder validieren), Audit-Log schreiben | | |
| TASK-032 | `GET /api/tickets/{id}` — Detail mit Kommentaren und Audit-History | | |
| TASK-033 | `PUT /api/tickets/{id}` — Ticket bearbeiten, Audit-Log für jede Änderung | | |
| TASK-034 | `PATCH /api/tickets/{id}/status` — Status ändern; bei "Erledigt" → IsArchived=true | | |
| TASK-035 | `PATCH /api/tickets/{id}/assign` — Verantwortlichen ändern | | |
| TASK-036 | `DELETE /api/tickets/{id}` — Hartes Löschen (nur Admin) | | |
| TASK-037 | `GET /api/tickets/archived` — Archiv-Ansicht | | |

#### GOAL-005: Kommentare, User, Admin APIs

| Task | Beschreibung | Completed | Date |
|------|-------------|-----------|------|
| TASK-040 | `GET /api/tickets/{id}/comments` — Kommentare abrufen | | |
| TASK-041 | `POST /api/tickets/{id}/comments` — Kommentar hinzufügen (kein PUT/DELETE) | | |
| TASK-042 | `GET /api/users` — User-Liste (alle authentifizierten Nutzer sehen User-Liste für Zuweisung) | | |
| TASK-043 | `POST /api/users` — Nutzer anlegen (Admin only) | | |
| TASK-044 | `PUT /api/users/{id}` — Nutzer bearbeiten (Admin only) | | |
| TASK-045 | `PATCH /api/users/{id}/deactivate` — Nutzer deaktivieren (Admin only) | | |
| TASK-046 | `GET/POST/PUT /api/categories` — Kategorien verwalten (Admin: POST/PUT, alle: GET) | | |
| TASK-047 | `GET/POST/PUT /api/types` — Typen verwalten | | |

#### GOAL-006: Reporting API

| Task | Beschreibung | Completed | Date |
|------|-------------|-----------|------|
| TASK-050 | `GET /api/reports/by-status` — Count je Status | | |
| TASK-051 | `GET /api/reports/by-assignee` — Tickets pro Verantwortlichem | | |
| TASK-052 | `GET /api/reports/by-priority` — Tickets nach Priorität | | |
| TASK-053 | `GET /api/reports/by-category` — Tickets nach Kategorie | | |
| TASK-054 | `GET /api/reports/by-type` — Tickets nach Typ | | |

---

### Phase 3: Frontend

#### GOAL-007: Vue-3-Grundstruktur

| Task | Beschreibung | Completed | Date |
|------|-------------|-----------|------|
| TASK-060 | Vite + Vue3 + TypeScript Init, Tailwind-Konfiguration mit Telekom-MMS-Farben (Magenta #E20074, Grau #6F7071) | | |
| TASK-061 | `src/types/index.ts` — TypeScript Interfaces für Ticket, User, Comment, Category, Type, Report | | |
| TASK-062 | `src/api/axios.ts` — Axios-Instance, Request-Interceptor (JWT aus Pinia), Response-Interceptor (401 → Redirect Login) | | |
| TASK-063 | `src/stores/auth.ts` — login(), logout(), currentUser, isAdmin, isAuthenticated | | |
| TASK-064 | `src/router/index.ts` — Routes: /, /tickets/:id, /admin, /reports, /login + Navigation Guards | | |

#### GOAL-008: Kanban-Board (Kernkomponente)

| Task | Beschreibung | Completed | Date |
|------|-------------|-----------|------|
| TASK-070 | `views/BoardView.vue` — Haupt-Layout mit FilterBar + 5 KanbanColumns | | |
| TASK-071 | `components/board/KanbanColumn.vue` — Spalte mit Status-Header, Ticket-Cards, vue-draggable-next | | |
| TASK-072 | `components/board/TicketCard.vue` — Karte: Titel, ID, Priorität (Farbe), Verantwortlicher, Fälligkeitsdatum, Kategorie/Typ | | |
| TASK-073 | Drag & Drop Handler — onDrop: PATCH /api/tickets/{id}/status | | |
| TASK-074 | `components/shared/FilterBar.vue` — Dropdowns (Verantwortlicher, Priorität, Kategorie, Typ), Datumsfilter, Suchfeld | | |
| TASK-075 | "Neues Ticket"-Button — floating FAB, öffnet TicketForm Modal | | |

#### GOAL-009: Ticket-Detail & Formulare

| Task | Beschreibung | Completed | Date |
|------|-------------|-----------|------|
| TASK-080 | `views/TicketDetailView.vue` — 2-Spalten-Layout (Stammdaten + Kommentare) | | |
| TASK-081 | `components/ticket/TicketForm.vue` — Formular mit Validation (vee-validate oder native), alle Pflichtfelder | | |
| TASK-082 | `components/ticket/CommentSection.vue` — Kommentarliste + Eingabefeld | | |
| TASK-083 | Audit-Trail Anzeige — "Zuletzt geändert von X am …" in Detail-Header | | |

#### GOAL-010: Admin-Bereich & Reporting

| Task | Beschreibung | Completed | Date |
|------|-------------|-----------|------|
| TASK-090 | `views/admin/AdminView.vue` — Navigation (User / Kategorien / Typen) | | |
| TASK-091 | `views/admin/UserManagement.vue` — Tabelle + Modal zum Anlegen/Bearbeiten | | |
| TASK-092 | `views/admin/CategoryManagement.vue` — Tabelle + Modal | | |
| TASK-093 | `views/admin/TypeManagement.vue` — Tabelle + Modal | | |
| TASK-094 | `views/ReportView.vue` — 4 Reportingkarten (By Status, By Assignee, By Priority, By Category) | | |

#### GOAL-011: i18n & UX

| Task | Beschreibung | Completed | Date |
|------|-------------|-----------|------|
| TASK-100 | `locales/de.json` + `locales/en.json` — alle UI-Texte | | |
| TASK-101 | Language-Toggle im Header (DE/EN) | | |
| TASK-102 | Loading-States (Spinner) bei API-Calls | | |
| TASK-103 | Error-Handling: Toast-Notifications bei API-Fehlern | | |
| TASK-104 | Responsive für Desktop (min. 1280px), aria-Labels für Key-Elemente | | |

---

## 4. Alternativen (nicht gewählt)

- **ALT-001**: Django statt FastAPI — Django hat mehr Overhead, FastAPI besser für reine APIs
- **ALT-002**: React statt Vue 3 — Vue simpler für kleinere Teams, vue-draggable direkt verfügbar
- **ALT-003**: Session-Cookies statt JWT — JWT passt besser zur SPA-Architektur
- **ALT-004**: SQLite statt PostgreSQL — PostgreSQL langfristig besser, kein zusätzlicher Container-Overhead gravierend

---

## 5. Dependencies

- **DEP-001**: Docker + Docker Compose auf Deployment-Server
- **DEP-002**: Internes TLS-Zertifikat (CA-signiert) für Nginx
- **DEP-003**: GitHub-Repository mit Actions-Zugriff
- **DEP-004**: Python 3.12+ auf Build-Agent (CI)
- **DEP-005**: Node.js 20+ auf Build-Agent (CI)

---

## 6. Testing

- **TEST-001**: `test_auth.py` — Login-Endpoints, ungültige Credentials, Token-Validierung
- **TEST-002**: `test_tickets.py` — CRUD, Statuswechsel, Auto-Archivierung, Validierung
- **TEST-003**: `test_users.py` — Admin-Only Endpoints (403 für Nicht-Admins)
- **TEST-004**: `test_reports.py` — Reporting-Endpoints, korrekte Aggregation
- **TEST-005**: Frontend Vitest — `TicketCard.spec.ts`, `FilterBar.spec.ts`, `BoardView.spec.ts`

---

## 7. Risiken & Annahmen

- **RISK-001**: Drag & Drop kann bei > 100 Karten/Spalte langsam werden → Pagination/Limit pro Spalte (max. 50)
- **RISK-002**: i18n nachträglich schwer → alle Texte von Anfang an externalisieren
- **ASSUMPTION-001**: Team hat Docker-Kenntnisse für Betrieb
- **ASSUMPTION-002**: Internes TLS-Zertifikat kann von IT bereitgestellt werden
- **ASSUMPTION-003**: GitHub Actions hat Zugriff auf Deployment-Server via SSH

---

## 8. Related Specifications

- [Architecture Plan](../docs/architecture/architecture-plan.md)
- [Project Roadmap](project-roadmap.md)
- [Security Review](../docs/security/security-review.md)
- [Lastenheft](../docs/Lastenheft%20ticket-tool.pdf)
