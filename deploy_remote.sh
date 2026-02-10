#!/bin/bash
set -e

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "🔍 Checking environment..."

# 1. Install Node.js if missing
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    nvm install 18
    nvm use 18
    nvm alias default 18
else
    echo "✅ Node.js is already installed: $(node -v)"
fi

# 2. Install PM2 if missing
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
else
    echo "✅ PM2 is already installed"
fi

# 3. Setup Directory & Code
APP_DIR="$HOME/projects/aicrone-app"
REPO_URL="https://github.com/vandejack/fleet-management.git"

if [ -d "$APP_DIR" ]; then
    echo "🔄 Updating existing repository..."
    cd $APP_DIR
    git fetch origin
    git reset --hard origin/main
else
    echo "📂 Cloning repository..."
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# 4. Configure Environment
echo "⚙️  Configuring .env..."
cat > .env <<EOF
DATABASE_URL="postgresql://aicrone_admin:admin123@localhost:5432/aicrone_fms?schema=public"
NEXTAUTH_URL="https://fms.aicrone.id"
NEXTAUTH_SECRET="fc873918a381830601f7052960686968"
TELEGRAM_BOT_TOKEN="8416304290:AAE9P67TCs6t-s7l-lnIMSnG-0Grb58TFEY"
TELEGRAM_CHAT_ID="100356956"
EOF

# 5. Build
echo "🏗️  Installing dependencies..."
npm ci

echo "🔨 Building application..."
npx prisma generate
npm run build

# 6. Start/Restart
echo "🚀 Starting application..."
if pm2 list | grep -q "fleet-management"; then
    pm2 restart fleet-management
else
    pm2 start npm --name "fleet-management" -- start
    pm2 save
fi

echo "✅ Manual Deployment Complete!"
