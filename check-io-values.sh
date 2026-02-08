#!/bin/bash
echo "--- RAW IO VALUES (Last 50) ---"
grep "VL IO ID" ~/.pm2/logs/teltonika-server-out.log | tail -n 50
