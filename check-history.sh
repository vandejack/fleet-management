#!/bin/bash
echo "--- SUCCESSFUL SAVES (Last 2000 lines) ---"
tail -n 2000 ~/.pm2/logs/teltonika-server-out.log | grep "Vehicle Found" | tail -n 10
echo ""
echo "--- PARSE EVENTS (Last 2000 lines) ---"
tail -n 2000 ~/.pm2/logs/teltonika-server-out.log | grep "\[PARSE\]" | tail -n 10
