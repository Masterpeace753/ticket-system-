# ADR-001: SQLAlchemy 2.0 Async als ORM

**Status**: Accepted  
**Datum**: 2026-04-19  
**Entscheider**: Entwicklungsteam

---

## Kontext

Das Backend basiert auf FastAPI, einem ASGI-Framework, das vollständig asynchrones I/O unterstützt. Der zentrale Flaschenhals bei Webanwendungen sind typischerweise Datenbankzugriffe. Die Wahl des ORM hat direkten Einfluss auf Durchsatz, Latenz unter Last und Wartbarkeit des Datenbankzugriffs.

**Anforderungen an den ORM-Layer:**
- Kompatibel mit asyncio (ASGI-nativer Stack)
- Type-Safety durch Python-Typsystem unterstützt
- Alembic-Integration für schemabasierte Migrationen
- PostgreSQL 16 als Primärdatenbank
- Langfristige Community-Unterstützung

---

## Entscheidung

Wir verwenden **SQLAlchemy 2.0 mit AsyncSession** über `asyncpg` als Datenbanktreiber.

```python
# Verbindungsaufbau
engine = create_async_engine(settings.DATABASE_URL, ...)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession)

# Verwendung in Routers via Dependency Injection
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
```

---

## Konsequenzen

**Positive:**
- Kein Thread-Blocking bei Datenbankabfragen — FastAPI kann unter Last deutlich mehr parallele Requests bedienen
- Volles Type-Checking mit MyPy durch SQLAlchemy 2.0 Mapped-Klassen
- Alembic unterstützt async nativ (seit Version 1.8)
- `asyncpg` ist der schnellste PostgreSQL-Treiber für Python (2–3× schneller als `psycopg2` in Benchmarks)

**Negative / Trade-offs:**
- Async-Fehler sind schwerer zu debuggen als synchroner Code (Stacktraces weniger lesbar)
- SQLite-Unterstützung für Tests erfordert `aiosqlite` als separaten Treiber
- Lernkurve für Entwickler, die async Python noch nicht kennen
- Bestimmte SQLAlchemy-Features (z.B. lazy loading von Relationships) funktionieren im async-Kontext nicht — explizites `selectinload()` bzw. `joinedload()` nötig

---

## Alternativen Betrachtet

### Option A: SQLAlchemy synchron (classic)
- Einfacher zu verstehen und zu debuggen
- **Abgelehnt**, weil: FastAPI läuft in einem Event-Loop; synchrone DB-Calls blockieren den gesamten Event-Loop und eliminieren den Vorteil von ASGI

### Option B: Tortoise ORM
- Async-first, Django-ORM-ähnliche API
- **Abgelehnt**, weil: kleineres Ökosystem, Alembic-Integration nicht nativ, weniger mature als SQLAlchemy

### Option C: Prisma (Python-Client)
- Modernes Schema-first ORM
- **Abgelehnt**, weil: Python-Client ist nicht production-ready (Stand 2026), externe Abhängigkeit auf Node.js-Runtime

---

## Referenzen

- [SQLAlchemy 2.0 Async Documentation](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [asyncpg Performance Benchmarks](https://github.com/MagicStack/asyncpg#performance)
- [FastAPI + SQLAlchemy Best Practices](https://fastapi.tiangolo.com/tutorial/sql-databases/)
