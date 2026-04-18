# ADR-002: JWT HS256 als Authentifizierungsmechanismus

**Status**: Accepted  
**Datum**: 2026-04-19  
**Entscheider**: Entwicklungsteam

---

## Kontext

Das Ticket-Tool ist eine interne Anwendung mit klar definiertem Nutzerkreis. Authentifizierung muss sicher, einfach zu betreiben und wartungsarm sein. Es gibt kein externes Identity-Provider-System im Unternehmen, das eingebunden werden müsste.

**Anforderungen:**
- Stateless: Backend soll keine Session-Daten persistieren müssen
- Kurze Token-Lebensdauer zum Minimieren des Missbrauchsrisikos bei Diebstahl
- Kein Einzel-Knoten-Ausfall durch zentralen Session-Store
- Einfach im Frontend handhabbar (SPA ohne Server-Side-Rendering)

---

## Entscheidung

Wir verwenden **JWT (JSON Web Tokens) mit HS256-Signatur** über `python-jose`.

- **Lebensdauer**: 60 Minuten (konfigurierbar via `ACCESS_TOKEN_EXPIRE_MINUTES`)
- **Algorithmus**: HMAC-SHA256 (HS256) — symmetrisch, ausreichend für single-server Deployment
- **Speicherort im Frontend**: `sessionStorage` (kein `localStorage`, kein Cookie)
- **Transport**: `Authorization: Bearer <token>` Header

```python
# Token-Ausstellung nach Login
def create_access_token(subject: str, expires_delta: timedelta) -> str:
    expire = datetime.utcnow() + expires_delta
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
```

---

## Konsequenzen

**Positive:**
- **Stateless**: Jeder Backend-Request ist selbst-validierend — kein DB-Lookup nötig für Auth
- **Horizontal skalierbar**: Mehrere Backend-Instanzen teilen nur den `SECRET_KEY`, keinen Session-Store
- **Einfach**: Keine Redis- oder Datenbank-Abhängigkeit für Session-Management
- **sessionStorage**: Token wird beim Browser-Tab-Schließen automatisch gelöscht (besser als `localStorage`)

**Negative / Trade-offs:**
- **Keine serverseitige Invalidierung**: Ein ausgestelltes Token ist bis zum Ablauf gültig — Logout ist nur clientseitig (Token wird im Store gelöscht)
  - **Mitigierung**: Kurze Token-Lebensdauer (60 Min), Benutzerstatus wird bei jedem Request geprüft (`is_active`)
- **HS256 = symmetrisch**: `SECRET_KEY` muss geheim bleiben und darf nie rotiert werden ohne alle aktiven Sessions zu invalidieren
  - **Mitigierung**: `SECRET_KEY` via Umgebungsvariable, nie im Code
- **Kein Refresh-Token-Mechanismus**: Nach 60 Minuten muss sich der Nutzer neu anmelden
  - Akzeptiert für internes Tool im Arbeitskontext

---

## Alternativen Betrachtet

### Option A: Server-Side Sessions (z.B. via Redis)
- Sofortige Invalidierung möglich (z.B. bei Passwortänderung oder Deaktivierung)
- **Abgelehnt**, weil: erfordert Redis als zusätzliche Infrastruktur-Komponente; erhöht Betriebskomplexität unverhältnismäßig für ein kleines internes Team

### Option B: JWT mit RS256 (asymmetrisch)
- Public-Key-Validierung möglich ohne `SECRET_KEY`-Sharing — sinnvoll bei Multi-Service-Architekturen
- **Abgelehnt**, weil: für Single-Backend ohne Microservices unnötige Komplexität (Key-Pair-Management, Rotation)

### Option C: OAuth 2.0 / OIDC (z.B. Keycloak, Auth0)
- Single Sign-On, zentrales User-Management
- **Abgelehnt**, weil: kein vorhandener Identity-Provider im Unternehmen; Hosting-Aufwand für Keycloak > Aufwand der eigenen Lösung; für <50 interne Nutzer überdimensioniert

---

## Sicherheitshinweise

- `SECRET_KEY` muss mindestens 256 Bit (32 Byte) zufällig generiert sein
- `SECRET_KEY` darf nie ins Git-Repository
- Bei Verdacht auf Kompromittierung: `SECRET_KEY` rotieren — invalidiert alle aktiven Sessions

```bash
# Sicheren Key generieren
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## Referenzen

- [RFC 7519 — JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519)
- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [FastAPI Security — OAuth2 with JWT](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/)
