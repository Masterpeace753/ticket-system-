# ADR-003: Modularer Monolith als Architekturstil

**Status**: Accepted  
**Datum**: 2026-04-19  
**Entscheider**: Entwicklungsteam

---

## Kontext

Beim Start des Projekts stand die Entscheidung, welchen Architekturstil das Backend verfolgen soll. Das Ticket-Tool ist ein internes Werkzeug für eine kleine Gruppe von Nutzern (< 50 Personen). Das Entwicklungsteam ist klein (1–3 Personen), ohne dediziertes DevOps-Personal.

**Rahmenbedingungen:**
- Kleines Team, keine Microservices-Erfahrung vorhanden
- Keine SLA-Anforderungen für einzelne Subdomänen (Tickets, Users, Reports)
- Self-hosted, kein Kubernetes oder Service-Mesh geplant
- Zeit bis MVP: wenige Wochen

---

## Entscheidung

Wir bauen einen **modularen Monolithen**: eine einzelne FastAPI-Applikation mit klar getrennten Modulen nach Domänen.

```
backend/app/
├── routers/      # HTTP-Layer je Domäne (tickets, users, categories, reports)
├── services/     # Business Logic Layer — nie aus Routers überspringen
├── models/       # SQLAlchemy ORM-Modelle
├── schemas/      # Pydantic I/O-Schemas (von Modellen getrennt)
└── dependencies.py  # Geteilte FastAPI-Dependencies (Auth, DB)
```

**Kernregel**: Kein Router ruft direkt die Datenbank auf — immer über den Service-Layer. Das ermöglicht spätere Extraktion einzelner Module ohne Router-Refactoring.

---

## Konsequenzen

**Positive:**
- **Einfacher Betrieb**: Ein Container, ein Prozess, ein Deployment-Artefakt
- **Kein Netzwerk-Overhead** zwischen Subdomänen (alles In-Process)
- **Einfaches Testing**: Kein Mocking von HTTP-Grenzen zwischen Services nötig
- **Schnelle Entwicklung**: Keine API-Versionierung oder Service-Discovery-Anforderungen
- **Klare Migrationsgrenze**: Durch den Service-Layer kann jedes Modul bei Bedarf in einen eigenständigen Service extrahiert werden

**Negative / Trade-offs:**
- **Gemeinsames Deployment**: Eine Änderung im Report-Modul erfordert Neustart des gesamten Backends
  - Akzeptiert: Deployment ist schnell (<30 Sekunden via Docker)
- **Gemeinsame Datenbank**: Alle Module teilen eine PostgreSQL-Instanz
  - Akzeptiert: Für die aktuelle Skala kein Problem; Isolierung durch Schema-Layer
- **Skalierung**: Das gesamte Backend skaliert, nicht einzelne Services
  - Akzeptiert: Load bei < 50 Nutzern rechtfertigt keine horizontale Per-Modul-Skalierung

---

## Abgrenzungsregeln (Modulare Integrität)

Um die Modularität zu wahren und eine spätere Migration zu erleichtern:

1. **Kein direkter Modell-Import über Domänengrenzen hinweg** — Kommunikation über Pydantic Schemas
2. **Kein Business-Logic-Code in Routers** — ausschließlich im Service-Layer
3. **Keine zyklischen Importe zwischen Services** — jeder Service importiert nur Modelle und externe Dependencies
4. **Audit-Trail über Service, nie direkt** — `audit_service.log_change()` als einziger Einstiegspunkt

---

## Skalierungspfad (wenn nötig)

Sollte das System auf > 500 gleichzeitige Nutzer oder mehrere Teams wachsen:

1. **Zunächst**: Horizontale Skalierung des bestehenden Monolithen (mehrere Instanzen hinter Nginx)
2. **Dann**: Extraktion des Reporting-Moduls als Read-Only-Service mit eigenem DB-Read-Replica
3. **Bei Bedarf**: Weitere Extraktion nach Domänen — dank sauberem Service-Layer ohne umfangreichen Refactor

---

## Alternativen Betrachtet

### Option A: Microservices von Beginn an
- Unabhängiges Deployment und Skalierung je Service
- **Abgelehnt**, weil: Team zu klein für Microservices-Overhead (Service-Discovery, API-Gateway, verteiltes Tracing, Netzwerk-Fehlerbehandlung); "Distributed Monolith"-Anti-Pattern sehr wahrscheinlich für kleines Team ohne Microservices-Erfahrung

### Option B: Klassischer Monolith (ohne Modulgrenzen)
- Einfachster Einstieg
- **Abgelehnt**, weil: Ohne Schichtentrennung entstehen schnell unüberschaubare Abhängigkeiten; Service-Layer und Modul-Grenzen kosten minimal extra Aufwand beim Aufbau, sparen aber massiv bei der Wartung

### Option C: Serverless Functions (AWS Lambda / Azure Functions)
- Kein Server-Management, Auto-Scaling
- **Abgelehnt**, weil: Self-hosted Anforderung; Cold-Start-Problematik für interaktive UI inakzeptabel; kein PostgreSQL-Connection-Pool sinnvoll ohne persistente Prozesse

---

## Referenzen

- [Sam Newman — "Monolith to Microservices" (O'Reilly)](https://www.oreilly.com/library/view/monolith-to-microservices/9781492047834/)
- [Martin Fowler — Modular Monolith](https://martinfowler.com/bliki/MonolithFirst.html)
- [FastAPI Project Structure Best Practices](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
