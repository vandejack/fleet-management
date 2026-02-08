#!/bin/bash
echo "--- ALL RAW DATA ---"
grep "\[RAW\]" ~/.pm2/logs/teltonika-server-out.log
echo ""
echo "--- ALL CONNECTIONS (Last 20) ---"
grep "Client connected" ~/.pm2/logs/teltonika-server-out.log | tail -n 20
