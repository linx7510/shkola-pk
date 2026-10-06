#!/bin/bash
# backup.sh — бэкап БД + медиа: локально (7 дней) и offsite в Yandex Object Storage (30 дней)
# cron: ежедневно 3:00 и каждые 6 часов (аудит 06.10.2026: добавлен offsite-слой, шифрование rclone crypt)
set -euo pipefail

BACKUP_DIR="/var/backups/shkola-pk"
DATE=$(date "+%Y%m%d_%H%M%S")
LOG=/var/log/shkola-pk-backup.log
REMOTE="yandex-crypt:backups"

mkdir -p "$BACKUP_DIR"

# ─── Локальный бэкап ───
for db in shkola_pk_payload; do  # Единая БД (audit — в схеме audit)
    sudo -u postgres pg_dump "$db" | gzip > "$BACKUP_DIR/${db}_${DATE}.sql.gz"
done

# Бэкап media директории (локальные медиа)
if [ -d "/var/www/shkola-pk/payload-cms/media" ]; then
    tar -czf "$BACKUP_DIR/media_${DATE}.tar.gz" -C /var/www/shkola-pk/payload-cms media 2>/dev/null || true
fi

# Хранить 7 дней локально
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "$(date): Backup created: ${BACKUP_DIR}/*_${DATE}.*" >> $LOG

# ─── Offsite: выгрузка в Yandex Object Storage (зашифровано rclone crypt) ───
offsite_fail() {
  echo "$(date): [ERROR] Offsite backup FAILED: $1" >> $LOG
  # Алерт письмом владельцу (SMTP ящика 22@велеслав.рус)
  python3 - "$1" <<'PYEOF' 2>/dev/null || true
import smtplib, sys
from email.message import EmailMessage
msg = EmailMessage()
msg["Subject"] = "🔴 ОШИБКА offsite-бэкапа shkola-pk"
msg["From"] = "22@xn--80adbka9ab1c.xn--p1acf"
msg["To"] = "boss@2980738.ru"
msg.set_content(f"Сбой выгрузки бэкапа в Yandex Object Storage:\n{sys.argv[1]}\n\nПроверьте: ssh root@80.78.244.84 → tail /var/log/shkola-pk-backup.log\n— мониторинг Школы ПК")
import subprocess
pw = subprocess.run(["bash","-c","grep '^SMTP_PASS=' /var/www/shkola-pk/apps/payload/.env | cut -d= -f2"],capture_output=True,text=True).stdout.strip()
with smtplib.SMTP("sm39.hosting.reg.ru", 587, timeout=30) as s:
    s.starttls(); s.login("22@xn--80adbka9ab1c.xn--p1acf", pw); s.send_message(msg)
PYEOF
}

if command -v rclone >/dev/null 2>&1 && [ -f /root/.config/rclone/rclone.conf ]; then
  # выгружаем только файлы, созданные за последние 24 часа (свежий слепок)
  if rclone copy "$BACKUP_DIR" "$REMOTE" --max-age 24h --quiet 2>>$LOG; then
    echo "$(date): Offsite: свежие копии выгружены в $REMOTE" >> $LOG
  else
    offsite_fail "rclone copy вернул ошибку (см. выше)"
  fi
  # очистка облачных копий старше 30 дней
  if rclone delete "$REMOTE" --min-age 720h --quiet 2>>$LOG; then
    echo "$(date): Offsite: retention 30 дней применён" >> $LOG
  else
    offsite_fail "rclone delete (retention) вернул ошибку"
  fi
else
  offsite_fail "rclone не установлен или конфиг отсутствует"
fi
