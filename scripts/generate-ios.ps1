# Check if user is running as Administrator (optional but good practice)
Write-Host "Checking for admin privileges..."
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "You are not running as Administrator. Some commands might fail."
}

# Install iOS Capacitor dependency
Write-Host "Installing @capacitor/ios..."
npm install @capacitor/ios
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install @capacitor/ios. Check your internet connection or lock files."
    exit $LASTEXITCODE
}

# Add iOS platform
Write-Host "Adding iOS platform..."
if (-not (Test-Path "ios")) {
    npx cap add ios
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to add iOS platform. Ensure you have the necessary prerequisites."
        exit $LASTEXITCODE
    }
}
else {
    Write-Host "iOS platform already exists. Skipping add..."
}

# Build the Next.js app
Write-Host "Building the Next.js application..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Next.js build failed. Please fix errors before proceeding."
    exit $LASTEXITCODE
}

# Sync with Capacitor
Write-Host "Syncing web assets to iOS project..."
npx cap sync ios
if ($LASTEXITCODE -ne 0) {
    Write-Error "Capacitor sync failed."
    exit $LASTEXITCODE
}

# Generate Assets
Write-Host "Generating iOS assets (icons/splash)..."
if (Test-Path "resources") {
    npx capacitor-assets generate --ios
}
else {
    Write-Warning "Resources folder not found. Skipping asset generation."
}

Write-Host "----------------------------------------------------------------"
Write-Host "SUCCESS: iOS project generated in the 'ios' directory!"
Write-Host "NEXT STEPS:"
Write-Host "1. Move the entire project folder (or just the 'ios' folder if using remote URL) to a Mac."
Write-Host "2. Open the 'ios/App' folder in Xcode."
Write-Host "3. Sign the app with your Apple Developer account."
Write-Host "4. Build and run on a Simulator or real iPhone."
Write-Host "----------------------------------------------------------------"
Read-Host -Prompt "Press Enter to exit"
