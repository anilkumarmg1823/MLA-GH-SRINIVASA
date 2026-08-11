/**
 * PM2 process file — run from repo root on EC2:
 *   pm2 start deploy/ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup
 */
module.exports = {
  apps: [
    {
      name: "kudligi-api",
      cwd: "./backend",
      script: "src/index.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 20,
      min_uptime: "10s",
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
      error_file: "../logs/api-error.log",
      out_file: "../logs/api-out.log",
      merge_logs: true,
      time: true,
    },
    {
      name: "kudligi-web",
      cwd: "./frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000 -H 127.0.0.1",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 20,
      min_uptime: "10s",
      max_memory_restart: "768M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "../logs/web-error.log",
      out_file: "../logs/web-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
