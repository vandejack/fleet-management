#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

cd ~/projects/aicrone-app
echo "Running TSC..."
npx tsc scripts/teltonika-server.ts || echo "TSC Failed or Skipped"
echo "Restarting Teltonika Server..."
pm2 restart teltonika-server
pm2 logs teltonika-server --lines 20 --nostream
