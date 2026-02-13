#!/bin/bash
# Force deployment script - overwrites all local changes on server

set -e

echo "🚀 Force deploying to production..."

cd /home/aicrone/projects/aicrone-app

echo "📥 Fetching latest changes..."
git fetch origin

echo "⚠️  FORCE RESETTING to origin/main (discarding local changes)..."
git reset --hard origin/main

echo "🧹 Cleaning up..."
git clean -fd

echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building application..."
npx prisma generate
npm run build

echo "🔄 Restarting services..."
pm2 restart fleet-management
pm2 restart teltonika-server

echo "✅ Force deployment complete!"
pm2 status
