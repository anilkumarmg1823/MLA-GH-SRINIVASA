#!/usr/bin/env bash
# First-time EC2 bootstrap (Ubuntu 24.04 / 22.04). Run as ubuntu user with sudo.
# Usage:
#   cd ~/MLA-GH-SRINIVASA
#   bash deploy/setup-ec2.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> Installing system packages"
sudo apt-get update -y
sudo apt-get install -y nginx git curl ufw fail2ban ca-certificates gnupg build-essential

if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js 20 LTS"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> Installing PM2 globally"
sudo npm install -g pm2

echo "==> Firewall (UFW): allow SSH + HTTP (+ HTTPS for later domain)"
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable || true

echo "==> fail2ban"
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

echo "==> Create logs dir"
mkdir -p "$REPO_ROOT/logs"

echo "==> Backend deps"
cd "$REPO_ROOT/backend"
npm ci --omit=dev || npm install --omit=dev
npx prisma generate

echo "==> Frontend deps + build (set NEXT_PUBLIC_* in frontend/.env.production first)"
cd "$REPO_ROOT/frontend"
npm ci || npm install
npm run build

echo "==> nginx site"
sudo cp "$REPO_ROOT/deploy/nginx-kudligi.conf" /etc/nginx/sites-available/kudligi
sudo ln -sf /etc/nginx/sites-available/kudligi /etc/nginx/sites-enabled/kudligi
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl reload nginx

echo "==> Start apps with PM2"
cd "$REPO_ROOT"
pm2 delete all 2>/dev/null || true
pm2 start deploy/ecosystem.config.cjs
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u "$USER" --hp "$HOME" | tail -n 1 | bash || true

echo ""
echo "Done."
echo "  Web:  http://$(curl -s ifconfig.me || echo YOUR_EC2_IP)/"
echo "  API:  http://$(curl -s ifconfig.me || echo YOUR_EC2_IP)/api/v1/"
echo "  Health: http://$(curl -s ifconfig.me || echo YOUR_EC2_IP)/health"
echo ""
echo "Useful:"
echo "  pm2 status"
echo "  pm2 logs"
echo "  pm2 restart all"
