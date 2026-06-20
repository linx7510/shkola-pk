#!/bin/bash
# deploy.sh — деплой платформы Школа ПК
# Использование: cd /var/www/shkola-pk && bash deploy.sh
set -euo pipefail

PROJECT_DIR="/var/www/shkola-pk"
cd "$PROJECT_DIR"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

log "════════ ДЕПЛОЙ НАЧАТ ════════"

# === 0. Сохранить текущий git commit (для отката) ===
PREV_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "none")
log "0. Previous commit: $PREV_COMMIT"

# === 1. Backup before deploy ===
log "1. Backup before deploy..."
BACKUP_DIR="/var/backups/shkola-pk/pre-deploy-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
for db in shkola_pk shkola_pk_payload shkola_pk_audit; do
    sudo -u postgres pg_dump "$db" 2>/dev/null | gzip > "$BACKUP_DIR/db_${db}.sql.gz" || true
done
log "   Backup: $BACKUP_DIR"

# === 1.5. Run migrations (BEFORE build) ===
log "1.5. Run migrations (BEFORE build)..."
bash "$PROJECT_DIR/scripts/migrate.sh" || { log "❌ Migration check failed! Aborting deploy."; exit 1; }

# === 2. Git pull ===
log "2. Git pull..."
cd "$PROJECT_DIR"
git pull --rebase origin main 2>&1 || log "   (no changes or rebase needed)"

# === 3. Install dependencies ===
log "3. Install dependencies..."
if [ -f "payload-cms/package.json" ]; then
    cd "$PROJECT_DIR/payload-cms"
    npm install --no-audit --no-fund 2>&1 | tail -3
fi
if [ -f "app-payload/package.json" ]; then
    cd "$PROJECT_DIR/app-payload"
    npm install --no-audit --no-fund 2>&1 | tail -3
fi

# === 4. Generate Payload importmap ===
log "4. Generate Payload importmap..."
cd "$PROJECT_DIR/payload-cms"
npx payload generate:importmap 2>&1 | tail -3

# === 5. Build Payload CMS ===
log "5. Build Payload CMS..."
cd "$PROJECT_DIR/payload-cms"
NODE_OPTIONS='--max-old-space-size=2048' npm run build 2>&1 | tail -5

# === 6. Build Frontend ===
log "6. Build Frontend..."
cd "$PROJECT_DIR/app-payload"
NODE_OPTIONS='--max-old-space-size=2048' npm run build 2>&1 | tail -5

# === 7. PM2 restart ===
log "7. PM2 restart..."
cd "$PROJECT_DIR"
pm2 restart all 2>&1 | tail -5
sleep 5

# === 8. Smoke test ===
log "8. Smoke test..."
if bash "$PROJECT_DIR/scripts/smoke-test.sh"; then
    log "✓ Smoke test passed!"
    log "9. PM2 save..."
    pm2 save 2>&1 | tail -3
    log "════════ ДЕПЛОЙ ЗАВЕРШЁН УСПЕШНО ════════"
else
    log "❌ SMOKE TEST FAILED! Starting rollback..."
    
    # === ROLLBACK ===
    log "ROLLBACK 1. Restoring previous git commit..."
    cd "$PROJECT_DIR"
    if [ "$PREV_COMMIT" != "none" ]; then
        git reset --hard "$PREV_COMMIT" 2>&1 || log "   (git reset failed)"
    fi
    
    log "ROLLBACK 2. Rebuilding..."
    cd "$PROJECT_DIR/payload-cms"
    NODE_OPTIONS='--max-old-space-size=2048' npm run build 2>&1 | tail -3
    cd "$PROJECT_DIR/app-payload"
    NODE_OPTIONS='--max-old-space-size=2048' npm run build 2>&1 | tail -3
    
    log "ROLLBACK 3. PM2 restart..."
    pm2 restart all 2>&1 | tail -3
    sleep 5
    
    log "ROLLBACK 4. Verifying..."
    if bash "$PROJECT_DIR/scripts/smoke-test.sh"; then
        log "✓ Rollback successful — site restored to previous state"
    else
        log "❌❌ ROLLBACK ALSO FAILED! Manual intervention required!"
        log "   Restore from backup: $BACKUP_DIR"
    fi
    
    log "════════ ДЕПЛОЙ ПРОВАЛЕН — ВЫПОЛНЕН ОТКАТ ════════"
    exit 1
fi
