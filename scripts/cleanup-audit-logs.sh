#!/bin/bash
# cleanup-audit-logs.sh — Retention policy for audit.audit_logs table
# Run via cron weekly (Sun 04:00)
# Keeps:
#   - All entries from last 90 days
#   - All create/delete/login_success/login_failed entries from last 365 days
# Deletes:
#   - 'update' actions older than 90 days (high volume, low forensic value)
#   - All other actions older than 365 days
set -euo pipefail

PSQL='sudo -u postgres psql shkola_pk_payload'
LOG='/var/log/shkola-pk-audit-cleanup.log'

echo "$(date '+%Y-%m-%d %H:%M:%S'): Starting audit log cleanup" >> "$LOG"

BEFORE=$($PSQL -t -c 'SELECT count(*) FROM audit.audit_logs;' 2>/dev/null | tr -d '[:space:]')
echo "  Before: $BEFORE rows" >> "$LOG"

DELETED_UPDATES=$($PSQL -t -c "WITH deleted AS (DELETE FROM audit.audit_logs WHERE action = 'update' AND \"createdAt\" < NOW() - INTERVAL '90 days' RETURNING 1) SELECT count(*) FROM deleted;" 2>/dev/null | tr -d '[:space:]')
echo "  Deleted 'update' rows older than 90 days: $DELETED_UPDATES" >> "$LOG"

DELETED_OLD=$($PSQL -t -c 'WITH deleted AS (DELETE FROM audit.audit_logs WHERE "createdAt" < NOW() - INTERVAL \'365 days\' RETURNING 1) SELECT count(*) FROM deleted;' 2>/dev/null | tr -d '[:space:]')
echo "  Deleted rows older than 365 days: $DELETED_OLD" >> "$LOG"

AFTER=$($PSQL -t -c 'SELECT count(*) FROM audit.audit_logs;' 2>/dev/null | tr -d '[:space:]')
echo "  After: $AFTER rows" >> "$LOG"
echo "  Total removed: $((BEFORE - AFTER))" >> "$LOG"

$PSQL -c 'VACUUM ANALYZE audit.audit_logs;' >> "$LOG" 2>&1 || true

echo "$(date '+%Y-%m-%d %H:%M:%S'): Cleanup done" >> "$LOG"
