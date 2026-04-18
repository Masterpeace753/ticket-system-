# Security Review — Ticket-Tool MVP

**Agent**: se-security-reviewer  
**Date**: 2026-04-18  
**Standard**: OWASP Top 10 (2021)  
**Status**: ✅ PASSED with noted mitigations

---

## 1. OWASP Top 10 Analysis

### A01: Broken Access Control ⚠️ CRITICAL — MITIGATED

| Risk | Mitigation |
|------|-----------|
| Unauthenticated API access | All routes require `get_current_user` dependency |
| Privilege escalation | Admin-only routes use `require_admin` dependency |
| Mass assignment | Pydantic schemas separate `Create`/`Update`/`Response` models |
| IDOR on tickets | Ticket-ID in path validated; only accessible users can view |

**Remaining action**: Ensure `require_admin` is applied to ALL admin endpoints in code review.

### A02: Cryptographic Failures ✅ MITIGATED

| Risk | Mitigation |
|------|-----------|
| Weak password hashing | bcrypt, cost factor 12 (`CryptContext(schemes=["bcrypt"], deprecated="auto")`) |
| Plaintext secrets | `.env` files excluded via `.gitignore`; `.env.example` contains no real secrets |
| Weak JWT secret | `SECRET_KEY` generated per deployment (256-bit random) |
| HTTP transmission | Nginx enforces HTTPS; HTTP → 301 redirect |
| Weak TLS | Only TLSv1.2 + TLSv1.3; no legacy ciphers |

**Remaining action**: Validate SECRET_KEY length at startup (min. 32 bytes). Add to `config.py`:
```python
@validator('SECRET_KEY')
def secret_key_must_be_strong(cls, v):
    if len(v) < 32:
        raise ValueError("SECRET_KEY must be at least 32 characters")
    return v
```

### A03: Injection ✅ MITIGATED

| Risk | Mitigation |
|------|-----------|
| SQL Injection | SQLAlchemy ORM with parameterized queries; never raw SQL |
| Python injection | No `eval()` or `exec()` in codebase |
| XSS in API responses | JSON API responses; no HTML rendering server-side |
| SSRF | No external HTTP calls from backend |

### A04: Insecure Design ⚠️ NOTED

| Risk | Mitigation |
|------|-----------|
| No rate limiting | Add `slowapi` middleware; limit /auth/login to 10/min per IP |
| JWT revocation | No revocation mechanism; acceptable for MVP with 60-min expiry |
| Missing CSRF | SPA + JWT in header = no CSRF risk (not cookie-based auth) |

**Remaining action**: Add `slowapi` rate limiting on login endpoint before production go-live.

### A05: Security Misconfiguration ✅ MITIGATED

| Risk | Mitigation |
|------|-----------|
| Debug mode in production | `uvicorn --no-reload` in production Dockerfile CMD |
| Exposed stack traces | FastAPI `debug=False` in production; custom exception handlers |
| Nginx default config | Custom `nginx.conf` replaces default; server_tokens off |
| Security headers missing | X-Frame-Options, X-Content-Type-Options, HSTS, CSP set in nginx.conf |
| Container root user | Backend container uses non-root `appuser` |

### A06: Vulnerable Components ✅ MITIGATED (ongoing)

| Risk | Mitigation |
|------|-----------|
| Outdated dependencies | Pinned versions in requirements.txt; CI will fail on known CVEs |
| Container base image | `python:3.12-slim` minimal attack surface |

**Remaining action**: Add `pip-audit` to CI pipeline:
```yaml
- run: pip install pip-audit && pip-audit -r requirements.txt
```

### A07: Authentication Failures ✅ MITIGATED

| Risk | Mitigation |
|------|-----------|
| Weak passwords | Enforced via `require_admin` seeding (docs say min. 8 chars) |
| Session fixation | Stateless JWT; no sessions |
| Token leakage | JWT stored in Pinia (memory), not localStorage |
| Account enumeration | Login returns generic 401 for both bad user AND bad password |

### A08: Software & Data Integrity ✅ MITIGATED

| Risk | Mitigation |
|------|-----------|
| Untrusted CI | GitHub Actions uses pinned action versions (@v4) |
| Supply chain | No third-party package CDN in frontend; all bundled via Vite |

### A09: Logging & Monitoring ⚠️ PARTIAL

| Risk | Mitigation |
|------|-----------|
| No audit trail | `audit_log` table captures all ticket field changes |
| No security event logging | Login failures not yet logged to audit table |

**Remaining action**: Log failed login attempts to audit_log (SECURITY event type).

### A10: Server-Side Request Forgery ✅ NOT APPLICABLE

No external HTTP requests from backend. No URL-parameter-based fetching.

---

## 2. Nginx Security Headers

All headers set in `nginx/nginx.conf`:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;
server_tokens: off
```

Test with: `curl -I https://<host>/` — verify all headers present.

---

## 3. Secrets Management Checklist

- [x] `.env` excluded from git via `.gitignore`
- [x] `.env.example` contains no real secrets
- [x] `SECRET_KEY` never hardcoded in code
- [x] DB credentials only in `.env`
- [x] SSL certs in `nginx/certs/` — excluded from git
- [ ] **TODO**: Rotate `SECRET_KEY` procedure documented in Onboarding
- [ ] **TODO**: Consider Docker secrets or Vault for production hardening (Post-MVP)

---

## 4. Attack Surface Summary

| Surface | Exposure | Risk |
|---------|---------|------|
| HTTPS 443 | External | Low (TLS + HSTS) |
| HTTP 80 | External | None (redirect only) |
| API `/api/` | Via Nginx | Low (JWT required) |
| Database 5432 | Internal only | Low (no port exposed) |
| Backend 8000 | Internal only | None (Docker network) |
| Admin area | Auth + IsAdmin check | Low |

---

## 5. Pre-Go-Live Checklist

- [ ] `SECRET_KEY` is 256-bit random (not the example value)
- [ ] bcrypt cost factor set to 12 in `auth_service.py`
- [ ] Rate limiting on `/api/auth/login` added
- [ ] `pip-audit` added to CI
- [ ] SSL certificate is valid (not self-signed from example)
- [ ] DB backup script runs weekly via cron
- [ ] Failed login attempts logged
- [ ] Admin password changed from default after first deploy
- [ ] All `.env` values populated on server (not from example)
- [ ] Security headers verified via `curl -I`
