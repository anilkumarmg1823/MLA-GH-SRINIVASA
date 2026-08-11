# Deploy Kudligi MLA on AWS EC2 (Mumbai) — testing via public IP

Both **frontend (Next.js)** and **backend (Express)** run on one EC2 instance behind **nginx**, managed by **PM2** so restarts and rolling feature updates are safe.

Stack already in AWS:

- Region: `ap-south-1` (Mumbai)
- RDS Postgres: `kudligi-mla-db`
- S3 media: `kudligi-mla-media`

---

## 1. Create EC2 (you do this in console)

1. Open [EC2 → Launch instance](https://ap-south-1.console.aws.amazon.com/ec2/home?region=ap-south-1#LaunchInstances:) in **ap-south-1**.
2. **Name:** `kudligi-mla-app`
3. **AMI:** Ubuntu Server 24.04 LTS
4. **Instance type:** `t3.medium`
5. **Key pair:** create/download `kudligi-mla-key.pem` (keep safe)
6. **Network / Security group** — create `kudligi-mla-sg`:

| Type | Port | Source | Why |
|------|------|--------|-----|
| SSH | 22 | **My IP** only | Admin access |
| HTTP | 80 | `0.0.0.0/0` | Public site (IP testing) |
| HTTPS | 443 | `0.0.0.0/0` | Ready for domain later |

Do **not** open 3000 or 4000 to the internet — nginx proxies them locally only.

7. **Storage:** 30 GB gp3
8. Launch → wait until **Running** → copy **Public IPv4** (example: `13.x.x.x`)

### RDS security group (required)

Edit RDS SG `default` / the one on `kudligi-mla-db`:

- Inbound **PostgreSQL 5432** from security group `kudligi-mla-sg` (better than 0.0.0.0/0).
- Keep your laptop IP rule only if you still need local Prisma from home.

---

## 2. SSH in

```bash
chmod 400 ~/Downloads/kudligi-mla-key.pem
ssh -i ~/Downloads/kudligi-mla-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

---

## 3. Clone repo + env files

```bash
cd ~
git clone https://github.com/anilkumarmg1823/MLA-GH-SRINIVASA.git
cd MLA-GH-SRINIVASA
```

### Backend env

```bash
nano backend/.env
```

Copy from `backend/.env.example`, then set at least:

```env
NODE_ENV=production
PORT=4000
# Browser origin = EC2 IP for now (comma-ok for multiple)
CORS_ORIGIN=http://YOUR_EC2_PUBLIC_IP
JWT_SECRET=<long-random-string>
DATABASE_URL=postgresql://kudligi_admin:YOUR_PASSWORD@kudligi-mla-db.c3uy64esspmc.ap-south-1.rds.amazonaws.com:5432/kudligi_mla?schema=public
AWS_REGION=ap-south-1
AWS_S3_BUCKET=kudligi-mla-media
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
WHATSAPP_ENABLED=false
```

### Frontend env (baked in at build time)

```bash
nano frontend/.env.production
```

```env
NEXT_PUBLIC_API_URL=http://YOUR_EC2_PUBLIC_IP/api/v1
NEXT_PUBLIC_SITE_URL=http://YOUR_EC2_PUBLIC_IP
```

---

## 4. One-shot bootstrap

```bash
bash deploy/setup-ec2.sh
```

This installs Node 20, nginx, UFW, fail2ban, PM2; builds the app; starts:

- `kudligi-api` → `127.0.0.1:4000`
- `kudligi-web` → `127.0.0.1:3000`
- nginx → public `:80`

Open:

- Site: `http://YOUR_EC2_PUBLIC_IP/`
- Health: `http://YOUR_EC2_PUBLIC_IP/health`
- SEO: `http://YOUR_EC2_PUBLIC_IP/robots.txt` and `/sitemap.xml`

---

## 5. Ongoing feature updates (PM2)

On the server after you push to GitHub:

```bash
cd ~/MLA-GH-SRINIVASA
bash deploy/update.sh
```

Or manually:

```bash
git pull
cd backend && npm ci --omit=dev && npx prisma generate && npx prisma db push
cd ../frontend && npm ci && npm run build
cd .. && pm2 reload deploy/ecosystem.config.cjs --update-env
```

Useful PM2:

```bash
pm2 status
pm2 logs kudligi-api
pm2 logs kudligi-web
pm2 restart all
```

---

## 6. Security checklist (this setup)

| Control | Status |
|---------|--------|
| App ports not public (only 80/443/22) | nginx + PM2 bind localhost |
| SSH limited to your IP | SG rule |
| UFW on host | setup script |
| fail2ban | setup script |
| Rate limits on `/api/` and `/login` | nginx |
| Security headers | nginx |
| Secrets only in `.env` on server (never git) | your responsibility |
| RDS not open to world | SG → EC2 SG only |

After domain purchase:

1. Point A record → EC2 Elastic IP
2. Update `CORS_ORIGIN`, `NEXT_PUBLIC_*`, rebuild frontend
3. `sudo apt install certbot python3-certbot-nginx && sudo certbot --nginx -d yourdomain.com`

---

## 7. Suggested Elastic IP

Allocate an **Elastic IP** and associate it with the instance so the public IP does not change after stop/start. Then update frontend `.env.production` once.
