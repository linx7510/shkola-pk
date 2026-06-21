#!/bin/bash
# smoke-test.sh — автоматическая проверка после деплоя
# Использование: bash /var/www/shkola-pk/scripts/smoke-test.sh
#
# Проверяет 10 параметров. Если хоть один падает — exit 1.
# deploy.sh вызывает этот скрипт после pm2 restart.
# При провале — deploy.sh делает откат.
set -euo pipefail

PROJECT_DIR="/var/www/shkola-pk"
LOG="/var/log/shkola-pk-smoke-test.log"
DATE=$(date "+%Y-%m-%d %H:%M:%S")
PASS=0
FAIL=0
TOTAL=10

# Telegram
set -a
[ -f /etc/environment ] && . /etc/environment
set +a
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"

send_telegram() {
    if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ -z "$TELEGRAM_CHAT_ID" ]; then return; fi
    local message="$1"
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
        -d "chat_id=${TELEGRAM_CHAT_ID}" \
        -d "text=${message}" \
        -d "parse_mode=HTML" > /dev/null 2>&1
}

check() {
    local name="$1"
    local result="$2"
    if [ "$result" = "OK" ]; then
        echo "  ✓ $name"
        echo "$DATE ✓ $name" >> "$LOG"
        PASS=$((PASS + 1))
    else
        echo "  ✗ $name — $result"
        echo "$DATE ✗ $name — $result" >> "$LOG"
        FAIL=$((FAIL + 1))
    fi
}

echo ""
echo "══════════════════════════════════════════════════════════"
echo "  SMOKE TEST — $DATE"
echo "══════════════════════════════════════════════════════════"
echo ""

# ═══ 1. PM2: оба процесса online ═══
echo "1. PM2 processes"
CMS_STATUS=$(pm2 list 2>/dev/null | grep shkola-pk-cms | grep -oE "online|errored|stopped" | head -1)
FRONTEND_STATUS=$(pm2 list 2>/dev/null | grep shkola-pk-frontend | grep -oE "online|errored|stopped" | head -1)
if [ "$CMS_STATUS" = "online" ] && [ "$FRONTEND_STATUS" = "online" ]; then
    check "PM2: CMS + Frontend online" "OK"
else
    check "PM2: CMS=$CMS_STATUS Frontend=$FRONTEND_STATUS" "FAIL: processes not online"
fi

# ═══ 2. Frontend (порт 3000): HTTP 200 на главной ═══
echo "2. Frontend :3000"
CODE=$(curl -s -m 10 -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>/dev/null || echo "000")
if [ "$CODE" = "200" ]; then
    check "Frontend / → HTTP 200" "OK"
else
    check "Frontend / → HTTP $CODE" "FAIL"
fi

# ═══ 3. Payload CMS (порт 3001): HTTP 200 на /admin ═══
echo "3. Payload CMS :3001"
CODE=$(curl -s -m 10 -o /dev/null -w '%{http_code}' http://localhost:3001/admin 2>/dev/null || echo "000")
if [ "$CODE" = "200" ]; then
    check "Payload /admin → HTTP 200" "OK"
else
    check "Payload /admin → HTTP $CODE" "FAIL"
fi

# ═══ 4. PostgreSQL: pg_isready ═══
echo "4. PostgreSQL"
if pg_isready -q 2>/dev/null; then
    check "PostgreSQL ready" "OK"
else
    check "PostgreSQL not ready" "FAIL"
fi

# ═══ 5. Ключевые страницы: HTTP 200 ═══
echo "5. Key pages HTTP 200"
PAGES_FAIL=0
for path in "/" "/blog" "/faq" "/glossary" "/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn"; do
    CODE=$(curl -s -m 10 -o /dev/null -w '%{http_code}' "http://localhost:3000${path}" 2>/dev/null || echo "000")
    if [ "$CODE" != "200" ] && [ "$CODE" != "307" ] && [ "$CODE" != "308" ]; then
        echo "    ✗ $path → HTTP $CODE"
        PAGES_FAIL=$((PAGES_FAIL + 1))
    fi
done
if [ "$PAGES_FAIL" = "0" ]; then
    check "All key pages OK (6 pages)" "OK"
else
    check "Key pages: $PAGES_FAIL failed" "FAIL"
fi

# ═══ 6. Контент: ключевые фразы в HTML главной ═══
echo "6. Content check on home page"
HOME_HTML=$(curl -s -m 10 http://localhost:3000/ 2>/dev/null || echo "")
CONTENT_FAIL=0
for phrase in "Школа" "Кооперативов" "Header" "footer"; do
    if ! echo "$HOME_HTML" | grep -qi "$phrase"; then
        echo "    ✗ '$phrase' not found"
        CONTENT_FAIL=$((CONTENT_FAIL + 1))
    fi
done
if [ "$CONTENT_FAIL" = "0" ]; then
    check "Home page content present" "OK"
else
    check "Home page: $CONTENT_FAIL phrases missing" "FAIL"
fi

# ═══ 7. Footer: ровно 1 (нет дублей) ═══
echo "7. Footer count"
FOOTER_COUNT=$(echo "$HOME_HTML" | grep -c "<footer" || echo "0")
if [ "$FOOTER_COUNT" = "1" ]; then
    check "Footer count = 1" "OK"
elif [ "$FOOTER_COUNT" = "0" ]; then
    check "Footer missing" "FAIL"
else
    check "Footer duplicated ($FOOTER_COUNT)" "FAIL"
fi

# ═══ 8. DB tables: >= 30 ═══
echo "8. DB tables count"
TABLE_COUNT=$(sudo -u postgres psql -d shkola_pk_payload -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'" 2>/dev/null | xargs || echo "0")
if [ "$TABLE_COUNT" -ge 30 ]; then
    check "DB tables = $TABLE_COUNT (>= 30)" "OK"
else
    check "DB tables = $TABLE_COUNT (< 30)" "FAIL"
fi

# ═══ 9. SSL: сертификат валиден ═══
echo "9. SSL certificate"
SSL_EXPIRY=$(echo | openssl s_client -connect 2980738.ru:443 -servername 2980738.ru 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2 || echo "")
if [ -n "$SSL_EXPIRY" ]; then
    EXPIRY_EPOCH=$(date -d "$SSL_EXPIRY" +%s 2>/dev/null || echo 0)
    NOW_EPOCH=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
    if [ "$DAYS_LEFT" -gt 7 ]; then
        check "SSL valid ($DAYS_LEFT days left)" "OK"
    else
        check "SSL expires in $DAYS_LEFT days" "FAIL"
    fi
else
    check "SSL check failed" "FAIL"
fi

# ═══ 10. /api/health: HTTP 200 ═══
echo "10. /api/health"
CODE=$(curl -s -m 10 -o /dev/null -w '%{http_code}' http://localhost:3000/api/health 2>/dev/null || echo "000")
if [ "$CODE" = "200" ]; then
    check "/api/health → HTTP 200" "OK"
else
    check "/api/health → HTTP $CODE" "FAIL"
fi

# ═══ ИТОГ ═══
echo ""
echo "══════════════════════════════════════════════════════════"
echo "  РЕЗУЛЬТАТ: $PASS/$TOTAL passed, $FAIL failed"
echo "══════════════════════════════════════════════════════════"
echo ""

if [ "$FAIL" -gt 0 ]; then
    MESSAGE="🔴 <b>Школа ПК: Smoke Test провален</b>%0A%0AПрошло: $PASS/$TOTAL%0AПровалено: $FAIL%0A%0AПроверьте https://2980738.ru/ вручную%0AЛог: /var/log/shkola-pk-smoke-test.log"
    send_telegram "$MESSAGE"
    echo "⚠ SMOKE TEST FAILED — $FAIL checks failed"
    exit 1
else
    MESSAGE="✅ <b>Школа ПК: Smoke Test пройден</b>%0A%0AВсе $TOTAL проверок OK%0Ahttps://2980738.ru/"
    send_telegram "$MESSAGE"
    echo "✓ SMOKE TEST PASSED — all $TOTAL checks OK"
    exit 0
fi
