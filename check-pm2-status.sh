#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

echo "=== PM2 LIST ==="
pm2 list
echo ""
echo "=== TELTONIKA SERVER DETAILS ==="
pm2 show teltonika-server
