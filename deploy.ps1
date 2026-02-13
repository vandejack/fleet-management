
# Configuration
$ServerIP = "192.168.1.101"
$User = "aicrone"
$RepoUrl = "https://github.com/vandejack/fleet-management.git"
$AppDir = "/home/aicrone/projects/aicrone-app"
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
    nvm install 20
    nvm use 20
    nvm alias default 20
else
    echo "✅ Node.js is already installed: $(node -v)"
    # Check version and upgrade if needed (simple check)
    if [[ $(node -v) == v18* ]]; then
        echo "⚠️  Upgrading Node.js 18 to 20..."
        nvm install 20
        nvm use 20
        nvm alias default 20
    fi
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
    echo "🔄 Updating existing repository (FORCING SYNC)..."
    cd $AppDir
    git fetch origin
    git reset --hard origin/$Branch
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

echo "🚀 Starting Teltonika Server..."
if pm2 list | grep -q "teltonika-server"; then
    pm2 restart teltonika-server
else
    # Run the TS script directly using npx tsx
    pm2 start npx --name "teltonika-server" -- tsx scripts/teltonika-server.ts
    pm2 save
fi

echo "✅ App running on http://$ServerIP:3000"
"@

Write-Host "Connecting to server... (You may be asked for your password: r1f4n11991)" -ForegroundColor Yellow
$RemoteScriptUnix = $RemoteScript.Replace("`r`n", "`n")

# Copy the Firebase service account file
Write-Host "📤 Uploading firebase-service-account.json..." -ForegroundColor Cyan

# Save the script to a local file for upload (avoiding quoting hell)
$RemoteScriptPath = "deploy_remote.sh"
$RemoteScriptUnix | Out-File -FilePath $RemoteScriptPath -Encoding utf8NoBOM

# Copy the Firebase service account file and the script
Write-Host "📤 Uploading files..." -ForegroundColor Cyan
$Destination = "$User@$ServerIP" + ":" + "$AppDir/"
scp firebase-service-account.json $RemoteScriptPath $Destination

# Execute the script
Write-Host "🚀 Executing remote script..." -ForegroundColor Cyan
ssh -t $User@$ServerIP "bash $AppDir/deploy_remote.sh"

Write-Host "Done." -ForegroundColor Cyan
