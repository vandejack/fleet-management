#!/bin/bash
set -e

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "📦 Setting up Node.js..."
nvm install 20
nvm use 20

cd ~/projects/aicrone-app

echo "⚙️  Configuring deployment environment..."
# Ensure AUTH_TRUST_HOST is set for NextAuth (important for reverse proxies)
# We append to .env.local or create .env.production to consistently apply it
if ! grep -q "AUTH_TRUST_HOST" .env; then
  echo "AUTH_TRUST_HOST=true" >> .env
fi
# Also ensure NEXTAUTH_URL is correct
if ! grep -q "NEXTAUTH_URL" .env; then
  echo "NEXTAUTH_URL=https://fms.aicrone.id" >> .env
fi

echo "🏗️  Installing dependencies..."
npm ci

echo "🔨 Building application..."
npx prisma generate
npm run build

echo "🚀 Restarting application..."
pm2 restart fleet-management

echo "✅ Deployment Complete!"
