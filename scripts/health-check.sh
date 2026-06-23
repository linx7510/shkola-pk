#!/bin/bash
# health-check.sh — расширенная проверка здоровья платформы (cron каждые 5 мин)
# v2: works with PM2 under shkola user, adds CPU/SSL/load checks
# Подгружаем env vars (для cron)
set -a
[ -f /etc/environment ] && . /etc/environment
set +a

LOG="/var/log/shkola-pk-monitor.log"
DATE=$(date "+%Y-%m-%d %H:%M:%S")

TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"
STATE_FILE="/tmp/shkola-pk-health-state"

# Run pm2 as shkola user (processes are owned by shkola now)
# NOTE: must wrap command in single quotes because 'su - shkola -c' takes ONE arg
pm2_as_shkola() {
    su - shkola -c "pm2 $*"
}

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
PREV_SSL="ok"
PREV_LOAD="ok"
if [ -f "$STATE_FILE" ]; then
    source "$STATE_FILE" 2>/dev/null
fi

CURRENT_FRONTEND="ok"
CURRENT_CMS="ok"
CURRENT_DISK="ok"
CURRENT_MEM="ok"
CURRENT_SSL="ok"
CURRENT_LOAD="ok"

# ─── Check Frontend (:3000) ───
if ! curl -sf http://localhost:3000/ > /dev/null 2>&1; then
    echo "$DATE [CRITICAL] Frontend (:3000) is down! Restarting..." >> $LOG
    pm2_as_shkola restart shkola-pk-frontend > /dev/null 2>&1
    sleep 3
    if curl -sf http://localhost:3000/ > /dev/null 2>&1; then
        echo "$DATE [OK] Frontend recovered after restart" >> $LOG
    else
        echo "$DATE [CRITICAL] Frontend still down after restart" >> $LOG
    fi
    CURRENT_FRONTEND="down"
    if [ "$PREV_FRONTEND" = "ok" ]; then
        send_telegram "🔴 <b>Школа ПК: Frontend упал</b>%0A%0AСервер был перезапущен автоматически. Проверьте https://2980738.ru/"
    fi
else
    if [ "$PREV_FRONTEND" = "down" ]; then
        send_telegram "✅ <b>Школа ПК: Frontend восстановлен</b>%0A%0Ahttps://2980738.ru/ снова работает"
    fi
fi

# ─── Check Payload CMS (:3001) ───
if ! curl -sf http://localhost:3001/admin > /dev/null 2>&1; then
    echo "$DATE [CRITICAL] Payload CMS (:3001) is down! Restarting..." >> $LOG
    pm2_as_shkola restart shkola-pk-cms > /dev/null 2>&1
    sleep 5
    if curl -sf http://localhost:3001/admin > /dev/null 2>&1; then
        echo "$DATE [OK] CMS recovered after restart" >> $LOG
    else
        echo "$DATE [CRITICAL] CMS still down after restart" >> $LOG
    fi
    CURRENT_CMS="down"
    if [ "$PREV_CMS" = "ok" ]; then
        send_telegram "🔴 <b>Школа ПК: Payload CMS упал</b>%0A%0AАдминка была перезапущена. Проверьте https://2980738.ru/admin"
    fi
else
    if [ "$PREV_CMS" = "down" ]; then
        send_telegram "✅ <b>Школа ПК: Payload CMS восстановлен</b>"
    fi
fi

# ─── Check HTTPS endpoint (external) ───
if ! curl -sfk https://2980738.ru/ > /dev/null 2>&1; then
    echo "$DATE [WARNING] HTTPS endpoint not responding" >> $LOG
    # Don't change CURRENT_FRONTEND — it's covered by local check above
fi

# ─── Check /api/health (расширенная проверка) ───
HEALTH_RESP=$(curl -s http://localhost:3000/api/health 2>/dev/null)
if [ -z "$HEALTH_RESP" ] || echo "$HEALTH_RESP" | grep -q '"status":"degraded"'; then
    echo "$DATE [WARNING] /api/health degraded: $HEALTH_RESP" >> $LOG
fi

# ─── Check disk space ───
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
DISK_THRESHOLD=${DISK_THRESHOLD:-85}
if [ "$DISK_USAGE" -ge "$DISK_THRESHOLD" ]; then
    echo "$DATE [WARNING] Disk usage: ${DISK_USAGE}% (threshold: ${DISK_THRESHOLD}%)" >> $LOG
    CURRENT_DISK="warning"
    if [ "$PREV_DISK" = "ok" ]; then
        send_telegram "⚠ <b>Школа ПК: Диск заполнен на ${DISK_USAGE}%</b>%0A%0AПорог: ${DISK_THRESHOLD}%0AПроверьте /var/www/shkola-pk/ и /var/backups/"
    fi
else
    if [ "$PREV_DISK" = "warning" ]; then
        send_telegram "✅ <b>Школа ПК: Диск в норме</b>%0A%0AИспользование: ${DISK_USAGE}%"
    fi
fi

# ─── Check memory ───
MEM_USAGE=$(free | awk '/Mem:/ {printf "%.0f", $3/$2*100}')
MEM_THRESHOLD=${MEM_THRESHOLD:-90}
if [ "$MEM_USAGE" -gt "$MEM_THRESHOLD" ]; then
    echo "$DATE [WARNING] Memory usage: ${MEM_USAGE}% (threshold: ${MEM_THRESHOLD}%)" >> $LOG
    CURRENT_MEM="warning"
    if [ "$PREV_MEM" = "ok" ]; then
        send_telegram "⚠️ <b>Школа ПК: Память ${MEM_USAGE}%</b>%0A%0APM2 процессы могут быть перезапущены"
    fi
else
    if [ "$PREV_MEM" = "warning" ]; then
        send_telegram "✅ <b>Школа ПК: Память в норме</b>%0A%0AИспользование: ${MEM_USAGE}%"
    fi
fi

# ─── Check SSL cert expiry (30 days warning) ───
SSL_DAYS_LEFT=$(echo | openssl s_client -servername 2980738.ru -connect 2980738.ru:443 2>/dev/null \
    | openssl x509 -noout -enddate 2>/dev/null \
    | cut -d= -f2 \
    | xargs -I{} date -d "{}" +%s 2>/dev/null \
    | xargs -I{} expr \( {} - $(date +%s) \) / 86400 2>/dev/null)

if [ -n "$SSL_DAYS_LEFT" ] && [ "$SSL_DAYS_LEFT" -lt 30 ]; then
    echo "$DATE [WARNING] SSL cert expires in ${SSL_DAYS_LEFT} days" >> $LOG
    CURRENT_SSL="warning"
    if [ "$PREV_SSL" = "ok" ]; then
        send_telegram "🔐 <b>Школа ПК: SSL сертификат истекает через ${SSL_DAYS_LEFT} дней</b>%0A%0AЗапустите: sudo certbot renew"
    fi
fi

# ─── Check system load (5-min average) ───
LOAD_AVG=$(cat /proc/loadavg | awk '{print $2}')
CPU_COUNT=$(nproc)
LOAD_THRESHOLD=$(echo "$CPU_COUNT * 2" | bc)  # 2x CPU cores
LOAD_INT=$(echo "$LOAD_AVG" | cut -d. -f1)
if [ "$LOAD_INT" -ge "$LOAD_THRESHOLD" ]; then
    echo "$DATE [WARNING] High load: ${LOAD_AVG} (cores: ${CPU_COUNT}, threshold: ${LOAD_THRESHOLD})" >> $LOG
    CURRENT_LOAD="warning"
    if [ "$PREV_LOAD" = "ok" ]; then
        send_telegram "⚡ <b>Школа ПК: Высокая нагрузка</b>%0A%0ALoad: ${LOAD_AVG} (cores: ${CPU_COUNT})"
    fi
fi

# ─── Check PM2 process count (sanity) ───
PM2_PROCS=$(pm2_as_shkola jlist 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d))" 2>/dev/null || echo 0)
if [ "$PM2_PROCS" -lt 2 ]; then
    echo "$DATE [CRITICAL] PM2 has only $PM2_PROCS processes (expected 2)" >> $LOG
    # Try resurrect from saved state
    pm2_as_shkola resurrect > /dev/null 2>&1
    if [ "$PREV_CMS" = "ok" ]; then
        send_telegram "🔴 <b>Школа ПК: PM2 процесс пропал</b>%0A%0AПопробовали resurrect. Проверьте: ssh root@server 'su - shkola -c pm2 list'"
    fi
fi

# ─── Сохранить состояние ───
cat > "$STATE_FILE" <<EOF
PREV_FRONTEND="$CURRENT_FRONTEND"
PREV_CMS="$CURRENT_CMS"
PREV_DISK="$CURRENT_DISK"
PREV_MEM="$CURRENT_MEM"
PREV_SSL="$CURRENT_SSL"
PREV_LOAD="$CURRENT_LOAD"
EOF

# Log summary line
echo "$DATE [OK] F=$CURRENT_FRONTEND C=$CURRENT_CMS D=${DISK_USAGE}% M=${MEM_USAGE}% SSL=${SSL_DAYS_LEFT:-?}d L=${LOAD_AVG}" >> $LOG
