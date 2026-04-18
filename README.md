# Ticket-Tool

> Internes Kanban-basiertes Aufgabenmanagementsystem für kleine Teams. Gebaut mit Vue 3, FastAPI und PostgreSQL.

![CI](https://github.com/Masterpeace753/ticket-system-/actions/workflows/ci.yml/badge.svg)

---

## Warum dieses Tool?

Externe Tools wie Jira oder Trello sind für kleine interne Teams oft überdimensioniert — zu viele Funktionen, zu viele Abhängigkeiten, zu viele Kosten. Ticket-Tool ist ein schlankes, vollständig self-hosted Kanban-System: kein SaaS, keine externen APIs, keine Nutzerdaten außer Haus.

**Kernfunktionen:**

- **Kanban-Board** mit Drag & Drop über 5 Status-Spalten (Neu → Zugewiesen → In Bearbeitung → Wartet auf Rückmeldung → Erledigt)
- **Ticket-Verwaltung** mit Priorität, Kategorie, Typ und Fälligkeitsdatum
- **Kommentare** (append-only) und vollständiger **Audit-Trail** aller Änderungen
- **Admin-Bereich** für Benutzerverwaltung, Kategorien und Typen
- **Reporting** nach Status, Verantwortlichem, Priorität und Kategorie
- **DE/EN** Mehrsprachigkeit, umschaltbar im UI

---

## Voraussetzungen

| Tool | Mindestversion |
|------|---------------|
| Docker | 24.x |
| Docker Compose | 2.x |
| Git | beliebig |

Für lokale Entwicklung ohne Docker zusätzlich:

| Tool | Version |
|------|---------|
| Python | 3.12 |
| Node.js | 20.x |
| PostgreSQL | 16 |

---

## Schnellstart (Entwicklung)

```bash
# 1. Repository klonen
git clone https://github.com/Masterpeace753/ticket-system-.git
cd ticket-system-

# 2. Umgebungsvariablen anlegen
cp .env.example .env
# Mindestens POSTGRES_PASSWORD und SECRET_KEY anpassen (siehe unten)

# 3. Entwicklungsumgebung starten
docker compose -f docker-compose.dev.yml up -d

# 4. Datenbank initialisieren (einmalig)
docker compose -f docker-compose.dev.yml exec backend alembic upgrade head

# 5. Fertig — Dienste erreichbar unter:
#    Frontend:   http://localhost:5173
#    Backend API: http://localhost:8000/api/docs
#    Login:      admin / changeme_admin  ← sofort ändern!
```

---

## Umgebungsvariablen

Die Datei `.env.example` enthält alle verfügbaren Variablen. Die kritischen für den Start:

| Variable | Beschreibung | Beispiel |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | Datenbankpasswort | `sicheres_passwort` |
| `DATABASE_URL` | Vollständige DB-URL | `postgresql://user:pw@db:5432/ticketdb` |
| `SECRET_KEY` | JWT-Signing-Key, **mind. 32 Zeichen** | siehe unten |
| `FIRST_ADMIN_USERNAME` | Benutzername des ersten Admins | `admin` |
| `FIRST_ADMIN_PASSWORD` | Passwort des ersten Admins | `sofort_ändern!` |

**SECRET_KEY generieren:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

> ⚠️ Niemals `.env` committen. Die Datei ist in `.gitignore` ausgeschlossen.

---

## Architektur

```
Browser
  │
  │ HTTPS 443
  ▼
Nginx (TLS-Termination)
  ├── /            → Frontend (Vue 3 SPA, statische Dateien)
  └── /api/        → Backend (FastAPI, Python)
                        │
                        ▼
                   PostgreSQL 16
```

Alle Services laufen als Docker-Container. Backend und Datenbank kommunizieren über ein internes Docker-Netzwerk — der DB-Port ist nie nach außen exponiert.

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
| Auth | JWT HS256 (python-jose), bcrypt cost 12 (passlib) |
| Validation | Pydantic v2 |
| Datenbank | PostgreSQL 16 |
| Proxy | Nginx 1.25 |
| Container | Docker + Docker Compose |

---

## Deployment (Produktion)

```bash
# 1. .env mit Produktionswerten befüllen
cp .env.example .env
# SECRET_KEY, POSTGRES_PASSWORD und FIRST_ADMIN_PASSWORD setzen

# 2. TLS-Zertifikat ablegen
#    nginx/certs/cert.pem
#    nginx/certs/key.pem

# 3. Starten und bauen
docker compose -f docker-compose.prod.yml up -d --build

# 4. DB migrieren
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

# 5. Admin-Passwort sofort im UI ändern!
```

**Deploy über GitHub Actions:**
Actions → *CD — Deploy to Server* → *Run workflow* → `environment: production`

---

## Backup

```bash
# Manuell — erzeugt eine komprimierte SQL-Datei im aktuellen Verzeichnis
docker compose -f docker-compose.prod.yml exec db \
  sh -c 'PGPASSWORD=$POSTGRES_PASSWORD pg_dump -U $POSTGRES_USER $POSTGRES_DB' \
  | gzip > backup_$(date +%Y%m%d).sql.gz

# Automatisch via Cron (wöchentlich, sonntags 02:00 Uhr)
0 2 * * 0 /pfad/zum/repo/backup/backup.sh >> /var/log/ticketbackup.log 2>&1
```

Ältere Backups werden automatisch rotiert — die Anzahl der beibehaltenen Versionen steuert `BACKUP_RETAIN` in `.env` (Standard: 4).

---

## Entwicklung

```bash
# Backend: Abhängigkeiten, Lint, Tests
cd backend
pip install -r requirements-dev.txt
ruff check . && black --check .
pytest --cov=app tests/

# Frontend: Abhängigkeiten, Lint, Tests, Build
cd frontend
npm install
npm run lint && npm run type-check
npm run test
npm run build
```

---

## Troubleshooting

**`alembic upgrade head` scheitert mit "relation already exists"**  
Die Datenbank enthält bereits Tabellen aus einem früheren Lauf. Container und Volume löschen:
```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml exec backend alembic upgrade head
```

**Frontend zeigt "Network Error" beim Login**  
Backend läuft noch nicht. Status prüfen:
```bash
docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.dev.yml logs backend
```

**Port 5173 oder 8000 bereits belegt**  
Ports in `docker-compose.dev.yml` unter `ports` anpassen und in `frontend/vite.config.ts` den Proxy-Target aktualisieren.

**Login schlägt fehl obwohl Passwort korrekt**  
Sicherstellen, dass `alembic upgrade head` ausgeführt wurde — ohne Migration gibt es keinen Admin-User.

---

## Projektdokumentation

- [Architekturplan](docs/architecture/architecture-plan.md)
- [Implementierungsplan](plan/implementation-plan.md)
- [Projektroadmap](plan/project-roadmap.md)
- [Sicherheitsanalyse](docs/security/security-review.md)
- [Onboarding für neue Teammitglieder](docs/onboarding.md)

---

## Lizenz

Internes Projekt — nicht für öffentliche Nutzung.
