#!/bin/bash
echo "--- TELTONIKA SERVER OUT LOG (Last 50 lines) ---"
cat ~/.pm2/logs/teltonika-server-out-*.log 2>/dev/null | tail -n 50 || cat ~/.pm2/logs/teltonika-server-out.log | tail -n 50
echo ""
echo "--- TELTONIKA SERVER ERROR LOG (Last 20 lines) ---"
cat ~/.pm2/logs/teltonika-server-error-*.log 2>/dev/null | tail -n 20 || cat ~/.pm2/logs/teltonika-server-error.log | tail -n 20
