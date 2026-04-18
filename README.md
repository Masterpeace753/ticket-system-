# Ticket-Tool

> Internes Kanban-basiertes Aufgabenmanagementsystem für kleine Teams. Gebaut mit Vue 3, FastAPI und PostgreSQL.

![CI](https://github.com/Masterpeace753/ticket-system-/actions/workflows/ci.yml/badge.svg)

---

## Übersicht

Ticket-Tool ist ein browserbasierbares Kanban-Board für den internen Einsatz. Keine externen Abhängigkeiten. Vollständig dockerisiert.

**Kernfunktionen:**
- Kanban-Board mit Drag & Drop (5 Status-Spalten)
- Ticket-Verwaltung mit Priorität, Kategorie, Typ, Fälligkeitsdaten
- Kommentare (append-only), Audit-Trail
- Admin-Bereich: User, Kategorien, Typen verwalten
- Reporting nach Status, Verantwortlichem, Priorität, Kategorie
- DE/EN Mehrsprachigkeit

---

## Schnellstart (Entwicklung)

```bash
# 1. Repository klonen
git clone https://github.com/Masterpeace753/ticket-system-.git
cd ticket-system-

# 2. Umgebungsvariablen anlegen
cp .env.example .env
# .env anpassen (DB-Passwort, SECRET_KEY etc.)

# 3. Entwicklungsumgebung starten
docker compose -f docker-compose.dev.yml up -d

# 4. Datenbank initialisieren
docker compose -f docker-compose.dev.yml exec backend alembic upgrade head

# 5. Frontend: http://localhost:5173
# 6. Backend API: http://localhost:8000/docs
# 7. Admin-User: admin / (aus .env FIRST_ADMIN_PASSWORD)
```

---

## Architektur

```
Browser
  │
  │ HTTPS 443
  ▼
Nginx (TLS-Termination)
  ├── /            → Frontend (Vue 3 SPA)
  └── /api/        → Backend (FastAPI)
                        │
                        ▼
                   PostgreSQL 16
```

Alle Services laufen als Docker-Container. Die Kommunikation zwischen Backend und DB ist intern und nie nach außen exponiert.

---

## Tech Stack

| Schicht | Technologie |
|---------|------------|
| Frontend | Vue 3, TypeScript, Vite, Pinia, Tailwind CSS |
| Drag & Drop | vue-draggable-next |
| i18n | vue-i18n |
| HTTP | Axios |
| Backend | Python 3.12, FastAPI |
| ORM | SQLAlchemy 2.0 (async), Alembic |
| Auth | JWT HS256 (python-jose), bcrypt (passlib) |
| Validation | Pydantic v2 |
| Database | PostgreSQL 16 |
| Proxy | Nginx 1.25 |
| Container | Docker + Docker Compose |

---

## Deployment (Produktion)

```bash
# 1. .env mit Produktionswerten befüllen
cp .env.example .env
# SECRET_KEY mit: python -c "import secrets; print(secrets.token_hex(32))"

# 2. TLS-Zertifikat in nginx/certs/ ablegen:
#    nginx/certs/cert.pem
#    nginx/certs/key.pem

# 3. Starten
docker compose -f docker-compose.prod.yml up -d --build

# 4. DB migrieren
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

**Manuelles Deploy via GitHub Actions:**  
Actions → CD — Deploy to Server → Run workflow → environment: production

---

## Backup

```bash
# Manuell ausführen:
docker compose -f docker-compose.prod.yml exec db \
  sh -c 'PGPASSWORD=$POSTGRES_PASSWORD pg_dump -U $POSTGRES_USER $POSTGRES_DB' \
  | gzip > backup_$(date +%Y%m%d).sql.gz

# Automatisch (Cron auf Server):
# 0 2 * * 0 /pfad/zum/backup/backup.sh >> /var/log/ticketbackup.log 2>&1
```

---

## Entwicklung

```bash
# Backend Lint + Test
cd backend
pip install -r requirements-dev.txt
ruff check . && black --check .
pytest --cov=app tests/

# Frontend Lint + Test + Build
cd frontend
npm install
npm run lint && npm run type-check
npm run test
npm run build
```

---

## Projektdokumentation

- [Architekturplan](docs/architecture/architecture-plan.md)
- [Implementierungsplan](plan/implementation-plan.md)
- [Projektroadmap](plan/project-roadmap.md)
- [Sicherheitsanalyse](docs/security/security-review.md)
- [Onboarding](docs/onboarding.md)

---

## Lizenz

Internes Projekt — nicht für öffentliche Nutzung.
