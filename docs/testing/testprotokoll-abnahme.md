# Abnahme-Testprotokoll — Ticket-Tool MVP

**Version**: 1.0  
**Datum**: ___________  
**Testumgebung**: ☐ Lokal (dev)  ☐ Staging  ☐ Produktion  
**Tester**: ___________  
**Git-Tag / Build**: ___________

---

## Zusammenfassung

| Kategorie | Gesamt | Bestanden ✅ | Fehlgeschlagen ❌ | Nicht getestet ⬜ |
|-----------|--------|-------------|------------------|-------------------|
| Authentifizierung | 4 | | | |
| Ticket-Verwaltung | 10 | | | |
| Kanban-Board | 4 | | | |
| Kommentare & Audit | 4 | | | |
| Suche & Filter | 4 | | | |
| Admin-Bereich | 6 | | | |
| Reporting | 2 | | | |
| i18n / Sprache | 2 | | | |
| Sicherheit | 4 | | | |
| Performance | 2 | | | |
| **Gesamt** | **42** | | | |

**Gesamtergebnis**: ☐ Abgenommen  ☐ Abnahme mit Auflagen (siehe Mängelliste)  ☐ Nicht abgenommen

---

## Legende

| Symbol | Bedeutung |
|--------|-----------|
| ✅ | Bestanden |
| ❌ | Fehlgeschlagen |
| ⬜ | Nicht getestet |
| ⚠️ | Bestanden mit Einschränkung |

---

## 1. Authentifizierung

| ID | Testfall | Schritte | Erwartetes Ergebnis | Status | Bemerkung |
|----|----------|----------|---------------------|--------|-----------|
| A-01 | Login mit gültigen Zugangsdaten | 1. URL öffnen<br>2. E-Mail: `admin@example.com`, PW: `Admin1234!` eingeben<br>3. „Anmelden" klicken | Weiterleitung zum Board, Name in Header | ⬜ | |
| A-02 | Login mit falschem Passwort | Falsches Passwort eingeben und absenden | Fehlermeldung „Ungültige Zugangsdaten", kein Login | ⬜ | |
| A-03 | Logout | Auf Logout-Button klicken | Weiterleitung zur Login-Seite, Token aus sessionStorage entfernt | ⬜ | |
| A-04 | Geschützter Bereich ohne Login | URL `/board` direkt aufrufen ohne Login | Weiterleitung zur Login-Seite | ⬜ | |

---

## 2. Ticket-Verwaltung

| ID | Testfall | Schritte | Erwartetes Ergebnis | Status | Bemerkung |
|----|----------|----------|---------------------|--------|-----------|
| T-01 | Ticket erstellen | 1. „Neues Ticket" klicken<br>2. Titel, Beschreibung, Priorität, Kategorie ausfüllen<br>3. Speichern | Ticket erscheint in Spalte „Neu" | ⬜ | |
| T-02 | Ticket-Pflichtfelder | Formular ohne Titel absenden | Validierungsfehler am Titel-Feld | ⬜ | |
| T-03 | Ticket bearbeiten | Ticket öffnen → Titel ändern → Speichern | Geänderter Titel wird angezeigt | ⬜ | |
| T-04 | Ticket löschen (Admin) | Als Admin: Ticket-Kontextmenü → Löschen → Bestätigen | Ticket verschwindet aus Board | ⬜ | |
| T-05 | Status: neu → zugewiesen | Ticket zuweisen | Status wechselt zu „zugewiesen" | ⬜ | |
| T-06 | Status: zugewiesen → in_bearbeitung | Drag & Drop auf „In Bearbeitung" | Statusänderung + Audit-Eintrag | ⬜ | |
| T-07 | Status: → wartet_auf_rueckmeldung | Drag & Drop auf entsprechende Spalte | Statusänderung korrekt | ⬜ | |
| T-08 | Status: → erledigt → Auto-Archivierung | Ticket auf „Erledigt" ziehen | Status = erledigt, `is_archived = true`, Ticket nicht mehr im Board | ⬜ | |
| T-09 | Ticket zuweisen | Mitarbeiter aus Dropdown wählen, speichern | Ticket zeigt Bearbeiter, Status = zugewiesen | ⬜ | |
| T-10 | Ticket-Priorität setzen | Priorität „Hoch" setzen, speichern | Prioritätsanzeige korrekt auf Board und Detailansicht | ⬜ | |

---

## 3. Kanban-Board

| ID | Testfall | Schritte | Erwartetes Ergebnis | Status | Bemerkung |
|----|----------|----------|---------------------|--------|-----------|
| K-01 | Board-Ansicht | Nach Login Board aufrufen | Spalten „Neu", „Zugewiesen", „In Bearbeitung", „Wartet", „Erledigt" sichtbar | ⬜ | |
| K-02 | Drag & Drop Statuswechsel | Ticket per Drag & Drop in andere Spalte ziehen | Status wird gespeichert, Ticket in richtiger Spalte | ⬜ | |
| K-03 | Ticket-Detailansicht öffnen | Auf Ticket-Karte klicken | Detailansicht öffnet mit allen Feldern | ⬜ | |
| K-04 | Board nach Reload korrekt | Seite neu laden | Tickets in korrekten Spalten, kein Datenverlust | ⬜ | |

---

## 4. Kommentare & Audit-Log

| ID | Testfall | Schritte | Erwartetes Ergebnis | Status | Bemerkung |
|----|----------|----------|---------------------|--------|-----------|
| C-01 | Kommentar hinzufügen | Ticket öffnen → Kommentar schreiben → Absenden | Kommentar erscheint im Verlauf mit Autor + Zeitstempel | ⬜ | |
| C-02 | Kommentar nicht editierbar | Kommentar-Eintrag ansehen | Kein Edit- oder Delete-Button vorhanden | ⬜ | |
| C-03 | Audit-Log bei Statusänderung | Status ändern, dann Audit-Tab öffnen | Eintrag mit altem/neuem Wert, Zeitstempel, Benutzer | ⬜ | |
| C-04 | Audit-Log bei Feldeditierung | Priorität ändern, speichern | Audit-Eintrag vorhanden | ⬜ | |

---

## 5. Suche & Filter

| ID | Testfall | Schritte | Erwartetes Ergebnis | Status | Bemerkung |
|----|----------|----------|---------------------|--------|-----------|
| S-01 | Volltextsuche | Suchbegriff eingeben, der im Titel eines Tickets vorkommt | Nur passende Tickets angezeigt | ⬜ | |
| S-02 | Filter: Status | Status-Filter auf „In Bearbeitung" setzen | Nur Tickets mit diesem Status sichtbar | ⬜ | |
| S-03 | Filter: Priorität | Prioritäts-Filter auf „Hoch" setzen | Nur hochpriore Tickets angezeigt | ⬜ | |
| S-04 | Filter: Meine Tickets | „Mir zugewiesen"-Filter aktivieren | Nur eigene Tickets sichtbar | ⬜ | |

---

## 6. Admin-Bereich

| ID | Testfall | Schritte | Erwartetes Ergebnis | Status | Bemerkung |
|----|----------|----------|---------------------|--------|-----------|
| ADM-01 | Admin-Bereich erreichbar | Als Admin: `/admin` aufrufen | Admin-Seite lädt | ⬜ | |
| ADM-02 | Admin-Bereich gesperrt für Nicht-Admin | Als normaler User `/admin` aufrufen | Zugriff verweigert / Weiterleitung | ⬜ | |
| ADM-03 | Benutzer anlegen | Neuen User mit E-Mail + Passwort erstellen | User erscheint in Liste | ⬜ | |
| ADM-04 | Benutzer deaktivieren | User auf „Inaktiv" setzen | User kann sich nicht mehr einloggen | ⬜ | |
| ADM-05 | Kategorie anlegen | Neue Kategorie erstellen | Kategorie in Ticket-Formular auswählbar | ⬜ | |
| ADM-06 | Ticket-Typ anlegen | Neuen Typ erstellen | Typ in Ticket-Formular auswählbar | ⬜ | |

---

## 7. Reporting

| ID | Testfall | Schritte | Erwartetes Ergebnis | Status | Bemerkung |
|----|----------|----------|---------------------|--------|-----------|
| R-01 | Reporting-View öffnen | Reporting-Link klicken | Statistiken nach Status, Priorität, Bearbeiter sichtbar | ⬜ | |
| R-02 | Reporting aktuell | Ticket erstellen, dann Reporting aufrufen | Neues Ticket in Statistik berücksichtigt | ⬜ | |

---

## 8. Mehrsprachigkeit (i18n)

| ID | Testfall | Schritte | Erwartetes Ergebnis | Status | Bemerkung |
|----|----------|----------|---------------------|--------|-----------|
| I-01 | Sprache: Deutsch | Sprachschalter auf DE | Alle UI-Texte auf Deutsch | ⬜ | |
| I-02 | Sprache: Englisch | Sprachschalter auf EN | Alle UI-Texte auf Englisch | ⬜ | |

---

## 9. Sicherheit

| ID | Testfall | Schritte | Erwartetes Ergebnis | Status | Bemerkung |
|----|----------|----------|---------------------|--------|-----------|
| SEC-01 | API ohne Token | `GET /api/tickets` ohne Authorization-Header aufrufen | HTTP 401 | ⬜ | |
| SEC-02 | Fremde Ressource | Als User A: URL von Ticket eines User B direkt aufrufen | Kein unberechtigter Zugriff auf Admin-Aktionen | ⬜ | |
| SEC-03 | Passwort-Anforderungen | Benutzer mit Passwort „123" anlegen | Validierungsfehler | ⬜ | |
| SEC-04 | Security-Headers | Response-Header in Browser-DevTools prüfen | `X-Content-Type-Options`, `X-Frame-Options` o.Ä. vorhanden | ⬜ | |

---

## 10. Performance

| ID | Testfall | Schritte | Erwartetes Ergebnis | Status | Bemerkung |
|----|----------|----------|---------------------|--------|-----------|
| P-01 | Board-Ladezeit | Board mit > 20 Tickets laden, Zeit messen | Seitenaufbau < 1 Sekunde | ⬜ | |
| P-02 | API-Antwortzeit | `GET /api/tickets` im Network-Tab messen | Response < 500 ms | ⬜ | |

---

## Mängelliste

Hier werden während des Abnahme-Tests gefundene Mängel dokumentiert:

| Nr. | Test-ID | Schweregrad | Beschreibung | Reproduzierbar | Status |
|-----|---------|-------------|-------------|----------------|--------|
| 1 | | ☐ Kritisch ☐ Mittel ☐ Gering | | ☐ Ja ☐ Nein | ☐ Offen ☐ Behoben |
| 2 | | ☐ Kritisch ☐ Mittel ☐ Gering | | ☐ Ja ☐ Nein | ☐ Offen ☐ Behoben |
| 3 | | ☐ Kritisch ☐ Mittel ☐ Gering | | ☐ Ja ☐ Nein | ☐ Offen ☐ Behoben |

---

## Abnahmeerklärung

> Hiermit bestätige ich, dass die oben dokumentierten Testfälle durchgeführt wurden und das System den beschriebenen Anforderungen entspricht (ggf. mit Auflagen laut Mängelliste).

| | |
|--|--|
| **Datum** | ___________________ |
| **Tester** | ___________________ |
| **Unterschrift** | ___________________ |
| **Abnahme erteilt von** | ___________________ |
| **Unterschrift** | ___________________ |
