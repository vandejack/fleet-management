#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

LOG_FILE=~/.pm2/logs/teltonika-server-out.log

echo "--- LAST 5 RAW PARSED ENTRIES (DEBUG_V1000) ---"
# Get the last 5 entries to see the progression
tail -n 2000 $LOG_FILE | grep -a "DEBUG_V1000" | grep "Codec: 8e" | tail -n 5

echo ""
echo "--- LAST 5 DATABASE SAVES (DEBUG_HIST) ---"
tail -n 2000 $LOG_FILE | grep -a "DEBUG_HIST" | grep "Creating history" | tail -n 5

echo ""
echo "--- LAST 5 RAW DATA RECEPTIONS (RAW) ---"
tail -n 2000 $LOG_FILE | grep -a "RAW" | tail -n 5
