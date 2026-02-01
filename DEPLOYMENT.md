# Production Deployment Guide

Follow these steps to deploy the Fleet Management System to your production server (`192.168.1.101`).

## 1. Prerequisites
Ensure the following are installed on the server:
- **Node.js** (v18 or higher)
- **Git**
- **PM2** (Process Manager, optional but recommended)
  ```bash
  npm install -g pm2
  ```

## 2. Get the Code
Navigate to your web directory (e.g., `/var/www/fleet-management` or `~/apps/fleet-management`) and clone/pull the repository.

```bash
# If cloning for the first time
git clone https://github.com/vandejack/fleet-management.git .

# If updating existing
git pull origin main
```

## 3. Environment Configuration
Create a `.env` file in the project root. This file is **not** committed to git for security.

```bash
nano .env
```

Paste the following content (adjusting where necessary):

```env
# Database (Using localhost since app and DB are on the same server)
DATABASE_URL="postgresql://aicrone_admin:admin123@localhost:5432/aicrone_fms?schema=public"

# Next.js / Auth
NEXTAUTH_URL="https://fms.aicrone.id"
NEXTAUTH_SECRET="generate-a-random-secret-here-at-least-32-chars"

# Telegram (If used)
TELEGRAM_BOT_TOKEN="8416304290:AAE9P67TCs6t-s7l-lnIMSnG-0Grb58TFEY"
TELEGRAM_CHAT_ID="100356956"
```

> [!TIP]
> You can generate a random secret with `openssl rand -base64 32`.

## 4. Install Dependencies & Build
Install the project dependencies and build the Next.js application.

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Build the application
npm run build
```

## 5. Start the Application
Use PM2 to start the application and keep it running in the background.

```bash
# Start with PM2
pm2 start npm --name "fleet-management" -- start

# Save PM2 list so it restarts on reboot
pm2 save
pm2 startup
```

The app will now be running on `http://localhost:3000`.

## 6. Cloudflare Tunnel (Already Configured)
Ensure your Cloudflare Tunnel is pointing to `http://localhost:3000`.

If you need to check:
```bash
# Example config in cloudflared config.yml
ingress:
  - hostname: fms.aicrone.id
    service: http://localhost:3000
    originRequest:
      noTLSVerify: true
```
