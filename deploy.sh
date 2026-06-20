#!/bin/bash
# deploy.sh — деплой платформы Школа ПК
# Использование: cd /var/www/shkola-pk && bash deploy.sh
set -euo pipefail

PROJECT_DIR="/var/www/shkola-pk"
cd "$PROJECT_DIR"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

log "1. Backup before deploy..."
BACKUP_DIR="/var/backups/shkola-pk/pre-deploy-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
for db in shkola_pk shkola_pk_payload shkola_pk_audit; do
    sudo -u postgres pg_dump "$db" 2>/dev/null | gzip > "$BACKUP_DIR/db_${db}.sql.gz" || true
done
log "   Backup: $BACKUP_DIR"

log "1.5. Run migrations (BEFORE build)..."
bash "$PROJECT_DIR/scripts/migrate.sh" || { log "❌ Migration check failed! Aborting deploy."; exit 1; }

log "2. Git pull..."
cd "$PROJECT_DIR"
git pull --rebase origin main 2>&1 || log "   (no changes or rebase needed)"

log "3. Install dependencies (if needed)..."
if [ -f "payload-cms/package.json" ]; then
    cd "$PROJECT_DIR/payload-cms"
    npm install --no-audit --no-fund 2>&1 | tail -3
fi
if [ -f "app-payload/package.json" ]; then
    cd "$PROJECT_DIR/app-payload"
    npm install --no-audit --no-fund 2>&1 | tail -3
fi

log "4. Generate Payload importmap..."
cd "$PROJECT_DIR/payload-cms"
npx payload generate:importmap 2>&1 | tail -3

log "5. Build Payload CMS..."
cd "$PROJECT_DIR/payload-cms"
npm run build 2>&1 | tail -5

log "6. Build Frontend..."
cd "$PROJECT_DIR/app-payload"
npm run build 2>&1 | tail -5

log "7. PM2 restart..."
cd "$PROJECT_DIR"
pm2 restart all 2>&1 | tail -5
sleep 5

log "8. Smoke test..."
echo "=== Pages ==="
for path in "/" "/admin" "/api/health" "/blog" "/courses" "/faq"; do
    code=$(curl -s -m 10 -o /dev/null -w '%{http_code}' "http://localhost:3000$path" 2>/dev/null || echo "000")
    echo "  $path -> HTTP $code"
done
echo "=== Payload CMS ==="
curl -s -m 5 -o /dev/null -w '  /admin -> HTTP %{http_code}\n' http://localhost:3001/admin
curl -s -m 5 -o /dev/null -w '  /api/access -> HTTP %{http_code}\n' http://localhost:3001/api/access

log "9. PM2 save..."
pm2 save 2>&1 | tail -3

log "✓ Деплой завершён успешно"
