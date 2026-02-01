
# Configuration
$ServerIP = "192.168.1.101"
$User = "aicrone"
$RepoUrl = "https://github.com/vandejack/fleet-management.git"
$AppDir = "/home/aicrone/projects/aicrone-app"
$Branch = "main"

Write-Host "🚀 Finishing Deployment on $User@$ServerIP..." -ForegroundColor Cyan

$RemoteScript = @"
set -e

# 1. Load NVM (in case it was not loaded automatically)
export NVM_DIR="`$HOME/.nvm"
[ -s "`$NVM_DIR/nvm.sh" ] && \. "`$NVM_DIR/nvm.sh"

echo "📦 Installing Node.js 20 - Required for Next.js 16..."
nvm install 20
nvm use 20
nvm alias default 20
echo "🔍 Node version: `$(node -v)"

# 2. Check/Install PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
    pm2 startup
fi

# 3. Setup Directory & Code
if [ ! -d "$AppDir" ]; then
    echo "📂 Cloning repository..."
    git clone $RepoUrl $AppDir
else
    echo "🔄 Pulling latest code..."
    cd $AppDir
    git pull origin $Branch
    cd ..
fi

cd $AppDir

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
# Trying to fix network issues by using standard registry and npm install
npm config set registry https://registry.npmjs.org/
npm install --no-audit

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

echo "✅ App is running!"
"@

# Fix Line Endings
$RemoteScriptUnix = $RemoteScript.Replace("`r`n", "`n")

Write-Host "Connecting to server... (Password: r1f4n11991)" -ForegroundColor Yellow
ssh -t $User@$ServerIP "bash -c '$RemoteScriptUnix'"

Write-Host "🎉 Done." -ForegroundColor Cyan
