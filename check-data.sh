#!/bin/bash
echo "--- RECENT IMEI (Last 10) ---"
grep "Device IMEI" ~/.pm2/logs/teltonika-server-out.log | tail -n 10
echo ""
echo "--- RECENT PARSE (Last 10) ---"
grep "\[PARSE\]" ~/.pm2/logs/teltonika-server-out.log | tail -n 10
