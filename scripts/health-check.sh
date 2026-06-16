#!/bin/bash
# Health check & monitoring for Shkola-PK
LOG="/var/log/shkola-pk-monitor.log"
DATE=$(date "+%Y-%m-%d %H:%M:%S")

# Check if Next.js is running
if ! curl -sf http://localhost:3000/ > /dev/null 2>&1; then
    echo "$DATE [CRITICAL] Next.js is down! Restarting..." >> $LOG
    cd /var/www/shkola-pk/app && pm2 restart shkola-pk
    echo "$DATE [INFO] PM2 restart executed" >> $LOG
else
    echo "$DATE [OK] Next.js is running" >> $LOG
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
if [ "$DISK_USAGE" -gt 85 ]; then
    echo "$DATE [WARNING] Disk usage: ${DISK_USAGE}%" >> $LOG
fi

# Check memory
MEM_USAGE=$(free | awk '/Mem:/ {printf "%.0f", $3/$2*100}')
if [ "$MEM_USAGE" -gt 90 ]; then
    echo "$DATE [WARNING] Memory usage: ${MEM_USAGE}%" >> $LOG
fi

