#!/usr/bin/env bash
# Pull latest code and reload PM2 (zero-ish downtime for feature updates).
# Usage on EC2: bash deploy/update.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> git pull"
git pull --ff-only origin main

echo "==> Backend"
cd "$REPO_ROOT/backend"
npm ci || npm install
npx prisma generate
# Apply schema if you changed prisma (safe for additive changes)
npx prisma db push

echo "==> Frontend build"
cd "$REPO_ROOT/frontend"
npm ci || npm install
npm run build

echo "==> Reload PM2"
cd "$REPO_ROOT"
pm2 reload deploy/ecosystem.config.cjs --update-env
pm2 save

echo "Updated. Check: pm2 status && curl -s localhost/health"
