#!/bin/bash
set -e

echo "=== Switching from Docker Compose to PM2 ==="

# 1. Stop Docker Compose
echo "Stopping Docker Compose..."
cd /var/www/shkola-pk
docker compose down

# 2. Start host nginx
echo "Starting host nginx..."
systemctl start nginx

# 3. Start PM2
echo "Starting PM2..."
pm2 start /var/www/shkola-pk/ecosystem.config.js

# 4. Wait for services
sleep 10

# 5. Verify
echo "Verifying..."
pm2 list

echo ""
echo "=== Switch complete! ==="
echo "To switch back to Docker:"
echo "  /var/www/shkola-pk/scripts/switch-to-docker.sh"
