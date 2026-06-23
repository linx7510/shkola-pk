module.exports = {
  apps: [
    {
      name: "shkola-pk-cms",
      script: "node_modules/next/dist/bin/next",
      args: "start --port 3001",
      cwd: "/var/www/shkola-pk/apps/payload",
      env: {
        NODE_ENV: "production",
      },
      max_memory_restart: "500M",
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      watch: false,
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
    {
      name: "shkola-pk-frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start --port 3000",
      cwd: "/var/www/shkola-pk/apps/frontend",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_memory_restart: "1G",
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      watch: false,
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
