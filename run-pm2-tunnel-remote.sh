#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found. Installing global pm2..."
    npm install -g pm2
fi

cd ~/projects/aicrone-app
pm2 delete ngrok-tunnel || true
pm2 start ./start-ngrok.sh --name ngrok-tunnel
pm2 save
pm2 list
