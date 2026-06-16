#!/bin/bash
# Database backup for Shkola-PK
BACKUP_DIR="/var/backups/shkola-pk"
DATE=$(date "+%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/shkola_pk_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

# Dump and compress
sudo -u postgres pg_dump shkola_pk | gzip > $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "shkola_pk_*.sql.gz" -mtime +7 -delete

echo "$(date): Backup created: $BACKUP_FILE" >> /var/log/shkola-pk-backup.log

