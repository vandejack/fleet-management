
# Configuration
$ServerIP = "192.168.1.101"
$User = "aicrone"
$RepoUrl = "https://github.com/vandejack/fleet-management.git"
$AppDir = "/home/aicrone/fleet-management"
$Branch = "main"

# Only used if you want to hardcode (NOT RECOMMENDED for security, better to key typing it)
# $Password = "r1f4n11991" 

Write-Host "🚀 Starting Deployment to $User@$ServerIP..." -ForegroundColor Cyan

# Define the remote script to run on the server
$RemoteScript = @"
set -e

echo "🔍 Checking environment..."

# 1. Install Node.js if missing (using NVM)
if ! command -v node &> /dev/null; then
    echo "📦 Installing NVM and Node.js..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="`$HOME/.nvm"
    [ -s "`$NVM_DIR/nvm.sh" ] && \. "`$NVM_DIR/nvm.sh"
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
    pm2 startup
else
    echo "✅ PM2 is already installed"
fi

# 3. Setup Directory & Code
if [ -d "$AppDir" ]; then
    echo "🔄 Updating existing repository..."
    cd $AppDir
    git pull origin $Branch
else
    echo "📂 Cloning repository..."
    git clone $RepoUrl $AppDir
    cd $AppDir
fi

# 4. Configure Environment
# Note: We use 'localhost' for DB because this runs ON the server
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

echo "✅ Deployment Complete! App running on http://$ServerIP:3000"
"@

# Execute the script remotely via SSH
# We use -t to force pseudo-terminal allocation so sudo/interactive commands might work better, 
# though mostly we want non-interactive here.
# IMPORTANT: Convert Windows CRLF to Unix LF before sending to bash!
$RemoteScriptUnix = $RemoteScript.Replace("`r`n", "`n")

Write-Host "Connecting to server... (You may be asked for your password: r1f4n11991)" -ForegroundColor Yellow
ssh -t $User@$ServerIP "bash -c '$RemoteScriptUnix'"

Write-Host "🎉 Done." -ForegroundColor Cyan
