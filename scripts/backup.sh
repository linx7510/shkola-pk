#!/bin/bash
# backup.sh — бэкап всех БД (cron ежедневно 3:00)
# Usage: bash /var/www/shkola-pk/scripts/backup.sh
set -euo pipefail

BACKUP_DIR="/var/backups/shkola-pk"
DATE=$(date "+%Y%m%d_%H%M%S")

mkdir -p "$BACKUP_DIR"

# Бэкап всех 3 БД
for db in shkola_pk shkola_pk_payload shkola_pk_audit; do
    sudo -u postgres pg_dump "$db" | gzip > "$BACKUP_DIR/${db}_${DATE}.sql.gz"
done

# Бэкап media директории (локальные медиа)
if [ -d "/var/www/shkola-pk/payload-cms/media" ]; then
    tar -czf "$BACKUP_DIR/media_${DATE}.tar.gz" -C /var/www/shkola-pk/payload-cms media 2>/dev/null || true
fi

# Хранить 7 дней
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "$(date): Backup created: ${BACKUP_DIR}/*_${DATE}.*" >> /var/log/shkola-pk-backup.log
