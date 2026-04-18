#!/usr/bin/env bash
# backup.sh — wöchentliches PostgreSQL-Backup mit Rotation (4 Generationen)
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETAIN="${BACKUP_RETAIN:-4}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="ticketdb_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Creating backup: $FILENAME"
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
  -h "${POSTGRES_HOST:-db}" \
  -U "${POSTGRES_USER:-ticketuser}" \
  -d "${POSTGRES_DB:-ticketdb}" \
  --clean --if-exists \
  | gzip > "${BACKUP_DIR}/${FILENAME}"

echo "[$(date)] Backup created: ${BACKUP_DIR}/${FILENAME}"

# Rotate: keep only RETAIN latest files
BACKUP_COUNT=$(find "$BACKUP_DIR" -maxdepth 1 -name "ticketdb_*.sql.gz" | wc -l)
if [ "$BACKUP_COUNT" -gt "$RETAIN" ]; then
  find "$BACKUP_DIR" -maxdepth 1 -name "ticketdb_*.sql.gz" \
    | sort | head -n "-${RETAIN}" | xargs rm -v
  echo "[$(date)] Old backups pruned. Retained: ${RETAIN}"
fi
