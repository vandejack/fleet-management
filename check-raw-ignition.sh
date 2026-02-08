#!/bin/bash
echo "--- RAW PARSER LOGS (Last 50) ---"
grep "DEBUG_V1000" ~/.pm2/logs/teltonika-server-out.log | tail -n 50
