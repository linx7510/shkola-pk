#!/bin/bash
set -e

echo "=== Switching from PM2 to Docker Compose ==="

# 1. Stop PM2 processes
echo "Stopping PM2 processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# 2. Stop host nginx (Docker nginx will replace it)
echo "Stopping host nginx..."
systemctl stop nginx

# 3. Start Docker Compose
echo "Starting Docker Compose..."
cd /var/www/shkola-pk
docker compose up -d

# 4. Wait for services
echo "Waiting for services to start..."
sleep 15

# 5. Verify
echo "Verifying..."
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:3000/ 2>/dev/null || echo "Frontend: unreachable"
curl -s -o /dev/null -w "Payload CMS: %{http_code}\n" http://localhost:3001/admin 2>/dev/null || echo "Payload: unreachable"
curl -s -o /dev/null -w "Nginx: %{http_code}\n" http://localhost:80/ 2>/dev/null || echo "Nginx: unreachable"

echo ""
echo "=== Switch complete! ==="
echo "To switch back to PM2:"
echo "  /var/www/shkola-pk/scripts/switch-to-pm2.sh"
