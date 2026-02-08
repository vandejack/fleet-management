#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

LOG_FILE=~/.pm2/logs/teltonika-server-out.log

echo "--- LAST CONNECTION ---"
grep "Client connected" $LOG_FILE | tail -n 1

echo ""
echo "--- LAST PARSED PACKET DETAILS ---"
# Get the last 50 lines matching our debug tags to ensure we capture a full record context
grep -E "DEBUG_V1000|DEBUG_HIST|RAW" $LOG_FILE | tail -n 50
