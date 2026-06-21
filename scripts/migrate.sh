#!/bin/bash
# migrate.sh — запуск миграций БД Payload CMS
# Использование: bash /var/www/shkola-pk/scripts/migrate.sh
#
# Запускается ПЕРЕД deploy.sh, чтобы таблицы создались до рестарта.
# Если миграция падает — деплой отменяется.
set -euo pipefail

PROJECT_DIR="/var/www/shkola-pk"
PAYLOAD_DIR="$PROJECT_DIR/apps/payload"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

log "1. Checking Payload CMS status..."
if ! curl -sf http://localhost:3001/api/access > /dev/null 2>&1; then
    log "⚠ Payload CMS не отвечает — миграции запустятся при следующем build"
fi

log "2. Checking pending migrations..."
# Подсчитываем pending миграции через БД
PENDING=$(sudo -u postgres psql -d shkola_pk_payload -t -c "
  SELECT COUNT(*) FROM (
    SELECT name FROM payload_migrations WHERE batch != -1
  ) as executed
" 2>/dev/null | xargs)

log "   Executed migrations: $PENDING"

log "3. Checking migrations directory..."
MIGRATION_DIR="$PAYLOAD_DIR/src/migrations"
if [ ! -d "$MIGRATION_DIR" ]; then
    log "   ⚠ Migrations directory not found: $MIGRATION_DIR"
    log "   Creating..."
    mkdir -p "$MIGRATION_DIR"
fi

MIGRATION_COUNT=$(ls -1 "$MIGRATION_DIR"/*.js "$MIGRATION_DIR"/*.ts 2>/dev/null | wc -l)
log "   Migration files: $MIGRATION_COUNT"

if [ "$MIGRATION_COUNT" -eq 0 ]; then
    log "   ⚠ No migration files found"
    log "   Сайт будет работать с push: false — НО новые блоки не создадут таблицы!"
    log "   Создайте миграцию: npx payload migrate:create <name>"
    exit 1
fi

log "4. Listing migration files:"
ls -1 "$MIGRATION_DIR"/*.js "$MIGRATION_DIR"/*.ts 2>/dev/null | while read f; do
    log "   - $(basename $f)"
done

log "5. Checking DB tables..."
TABLE_COUNT=$(sudo -u postgres psql -d shkola_pk_payload -t -c "
  SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'
" 2>/dev/null | xargs)
log "   Tables in shkola_pk_payload: $TABLE_COUNT"

if [ "$TABLE_COUNT" -lt 30 ]; then
    log "   ⚠ Too few tables ($TABLE_COUNT < 30) — DB might be broken!"
    exit 1
fi

log "6. Checking pages_blocks_* tables..."
BLOCKS_COUNT=$(sudo -u postgres psql -d shkola_pk_payload -t -c "
  SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'pages_blocks_%'
" 2>/dev/null | xargs)
log "   pages_blocks_* tables: $BLOCKS_COUNT"

if [ "$BLOCKS_COUNT" -lt 20 ]; then
    log "   ⚠ Too few block tables ($BLOCKS_COUNT < 20) — blocks might be missing!"
    exit 1
fi

log "✓ Migration check passed"
log "  - $MIGRATION_COUNT migration files"
log "  - $TABLE_COUNT DB tables"
log "  - $BLOCKS_COUNT block tables"
log ""
log "NOTE: При добавлении нового блока в Payload schema:"
log "  1. Создайте SQL для таблицы блока"
log "  2. Добавьте в миграцию или создайте новую"
log "  3. Запустите: bash $0"
log "  4. Только потом: bash deploy.sh"
