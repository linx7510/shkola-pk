#!/bin/bash
# rollback.sh — ручной откат к предыдущей версии
# Использование: bash /var/www/shkola-pk/scripts/rollback.sh [commit_hash]
#
# Без аргументов: откат к HEAD~1 (предыдущий commit)
# С аргументом: откат к указанному commit
#
# Процесс:
# 1. Восстановить БД из последнего бэкапа
# 2. git reset --hard к указанному commit
# 3. Rebuild (payload + frontend)
# 4. PM2 restart
# 5. Smoke test
set -euo pipefail

PROJECT_DIR="/var/www/shkola-pk"
cd "$PROJECT_DIR"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

TARGET_COMMIT="${1:-HEAD~1}"

log "════════ ОТКАТ НАЧАТ ════════"
log "Target commit: $TARGET_COMMIT"

# === 0. Показать текущее состояние ===
log "0. Current state:"
log "   HEAD: $(git rev-parse --short HEAD)"
log "   Target: $(git rev-parse --short $TARGET_COMMIT 2>/dev/null || echo 'INVALID')"
git log --oneline -5

# === 1. Найти последний бэкап БД ===
log "1. Finding latest DB backup..."
BACKUP_DIR=$(ls -td /var/backups/shkola-pk/pre-deploy-* 2>/dev/null | head -1)
if [ -z "$BACKUP_DIR" ]; then
    log "   ⚠ No pre-deploy backup found. Skipping DB restore."
else
    log "   Found: $BACKUP_DIR"
    
    # === 1.5. Восстановить БД ===
    log "1.5. Restoring databases..."
    for db in shkola_pk shkola_pk_payload shkola_pk_audit; do
        BACKUP_FILE="$BACKUP_DIR/db_${db}.sql.gz"
        if [ -f "$BACKUP_FILE" ]; then
            log "   Restoring $db..."
            gunzip -c "$BACKUP_FILE" | sudo -u postgres psql -d "$db" > /dev/null 2>&1 || log "   ⚠ Restore $db failed (continuing)"
        else
            log "   ⚠ Backup file not found: $BACKUP_FILE"
        fi
    done
    log "   ✓ Databases restored"
fi

# === 2. Git reset ===
log "2. Git reset to $TARGET_COMMIT..."
git reset --hard "$TARGET_COMMIT"
log "   ✓ Now at: $(git rev-parse --short HEAD)"

# === 3. Rebuild ===
log "3. Rebuilding Payload CMS..."
cd "$PROJECT_DIR/payload-cms"
NODE_OPTIONS='--max-old-space-size=2048' npm run build 2>&1 | tail -5

log "4. Rebuilding Frontend..."
cd "$PROJECT_DIR/app-payload"
NODE_OPTIONS='--max-old-space-size=2048' npm run build 2>&1 | tail -5

# === 5. PM2 restart ===
log "5. PM2 restart..."
cd "$PROJECT_DIR"
pm2 restart all 2>&1 | tail -5
sleep 5

# === 6. Smoke test ===
log "6. Smoke test..."
if bash "$PROJECT_DIR/scripts/smoke-test.sh"; then
    log "✓ SMOKE TEST PASSED — rollback successful!"
    log "   Site restored to: $(git rev-parse --short HEAD)"
    pm2 save 2>&1 | tail -2
    log "════════ ОТКАТ ЗАВЕРШЁН УСПЕШНО ════════"
else
    log "❌ SMOKE TEST FAILED after rollback!"
    log "   Manual intervention required."
    log "   Backup: $BACKUP_DIR"
    log "════════ ОТКАТ НЕ УДАЛСЯ — ТРЕБУЕТСЯ ВМЕШАТЕЛЬСТВО ════════"
    exit 1
fi
