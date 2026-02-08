#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

LOG_FILE=~/.pm2/logs/teltonika-server-out.log

echo "--- RAW LOGS FOR BEHAVIOR EVENTS (Last 1000 lines) ---"
# Grep for event keywords and specific IO IDs if known (though parser maps them to text)
grep -a -E "Absence|Drowsiness|Distraction|Yawning|Smoking|Phone|EVENT" $LOG_FILE | tail -n 20
