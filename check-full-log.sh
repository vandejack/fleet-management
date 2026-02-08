#!/bin/bash
date
echo "--- FULL LOG TAIL (Last 50) ---"
tail -n 50 ~/.pm2/logs/teltonika-server-out.log
