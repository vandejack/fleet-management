#!/bin/bash
ls -l ~/.pm2/logs/ngrok-tunnel*
echo "--- OUT LOG ---"
cat ~/.pm2/logs/ngrok-tunnel-out-*.log 2>/dev/null || cat ~/.pm2/logs/ngrok-tunnel-out.log
echo "--- ERROR LOG ---"
cat ~/.pm2/logs/ngrok-tunnel-error-*.log 2>/dev/null || cat ~/.pm2/logs/ngrok-tunnel-error.log
