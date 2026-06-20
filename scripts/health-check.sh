#!/bin/bash
# health-check.sh — проверка здоровья платформы (cron каждые 5 мин)
# + Telegram уведомления при сбоях
# Подгружаем env vars (для cron)
set -a
[ -f /etc/environment ] && . /etc/environment
set +a

LOG="/var/log/shkola-pk-monitor.log"
DATE=$(date "+%Y-%m-%d %H:%M:%S")

TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"
STATE_FILE="/tmp/shkola-pk-health-state"

send_telegram() {
    if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ -z "$TELEGRAM_CHAT_ID" ]; then
        return
    fi
    local message="$1"
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
        -d "chat_id=${TELEGRAM_CHAT_ID}" \
        -d "text=${message}" \
        -d "parse_mode=HTML" > /dev/null 2>&1
}

# Состояние предыдущей проверки
PREV_FRONTEND="ok"
PREV_CMS="ok"
PREV_DISK="ok"
PREV_MEM="ok"
if [ -f "$STATE_FILE" ]; then
    source "$STATE_FILE"
fi

CURRENT_FRONTEND="ok"
CURRENT_CMS="ok"
CURRENT_DISK="ok"
CURRENT_MEM="ok"

# Check Frontend (:3000)
if ! curl -sf http://localhost:3000/ > /dev/null 2>&1; then
    echo "$DATE [CRITICAL] Frontend (:3000) is down! Restarting..." >> $LOG
    pm2 restart shkola-pk-frontend
    echo "$DATE [INFO] Frontend restarted" >> $LOG
    CURRENT_FRONTEND="down"
    if [ "$PREV_FRONTEND" = "ok" ]; then
        send_telegram "🔴 <b>Школа ПК: Frontend упал</b>%0A%0AСервер был перезапущен автоматически. Проверьте https://2980738.ru/"
    fi
else
    echo "$DATE [OK] Frontend running" >> $LOG
    if [ "$PREV_FRONTEND" = "down" ]; then
        send_telegram "✅ <b>Школа ПК: Frontend восстановлен</b>%0A%0Ahttps://2980738.ru/ снова работает"
    fi
fi

# Check Payload CMS (:3001)
if ! curl -sf http://localhost:3001/admin > /dev/null 2>&1; then
    echo "$DATE [CRITICAL] Payload CMS (:3001) is down! Restarting..." >> $LOG
    pm2 restart shkola-pk-cms
    echo "$DATE [INFO] Payload CMS restarted" >> $LOG
    CURRENT_CMS="down"
    if [ "$PREV_CMS" = "ok" ]; then
        send_telegram "🔴 <b>Школа ПК: Payload CMS упал</b>%0A%0AАдминка была перезапущена. Проверьте https://2980738.ru/admin"
    fi
else
    echo "$DATE [OK] Payload CMS running" >> $LOG
    if [ "$PREV_CMS" = "down" ]; then
        send_telegram "✅ <b>Школа ПК: Payload CMS восстановлен</b>"
    fi
fi

# Check /api/health (расширенная проверка)
HEALTH_RESP=$(curl -s http://localhost:3000/api/health 2>/dev/null)
if [ -z "$HEALTH_RESP" ] || echo "$HEALTH_RESP" | grep -q '"status":"degraded"'; then
    echo "$DATE [WARNING] /api/health degraded: $HEALTH_RESP" >> $LOG
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
if [ "$DISK_USAGE" -gt 85 ]; then
    echo "$DATE [WARNING] Disk usage: ${DISK_USAGE}%" >> $LOG
    CURRENT_DISK="warning"
    if [ "$PREV_DISK" = "ok" ]; then
        send_telegram "⚠️ <b>Школа ПК: Диск заполнен на ${DISK_USAGE}%</b>"
    fi
fi

# Check memory
MEM_USAGE=$(free | awk '/Mem:/ {printf "%.0f", $3/$2*100}')
if [ "$MEM_USAGE" -gt 90 ]; then
    echo "$DATE [WARNING] Memory usage: ${MEM_USAGE}%" >> $LOG
    CURRENT_MEM="warning"
    if [ "$PREV_MEM" = "ok" ]; then
        send_telegram "⚠️ <b>Школа ПК: Память ${MEM_USAGE}%</b>"
    fi
fi

# Сохранить состояние
cat > "$STATE_FILE" <<EOF
PREV_FRONTEND="$CURRENT_FRONTEND"
PREV_CMS="$CURRENT_CMS"
PREV_DISK="$CURRENT_DISK"
PREV_MEM="$CURRENT_MEM"
EOF
