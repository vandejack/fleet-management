#!/bin/bash
echo "--- NGROK LOGS (Last 100) ---"
cat ~/.pm2/logs/ngrok-tunnel-out-*.log 2>/dev/null | tail -n 100 || cat ~/.pm2/logs/ngrok-tunnel-out.log | tail -n 100
echo ""
echo "--- NGROK ERRORS (Last 50) ---"
cat ~/.pm2/logs/ngrok-tunnel-error-*.log 2>/dev/null | tail -n 50 || cat ~/.pm2/logs/ngrok-tunnel-error.log | tail -n 50
