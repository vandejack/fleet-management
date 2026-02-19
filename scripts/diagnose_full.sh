#!/bin/bash

echo "======================================================="
echo "       FLEET MANAGEMENT PRODUCTION DIAGNOSTIC          "
echo "======================================================="
echo "Date: $(date)"
echo "Server: $(hostname)"
echo ""

# 1. Check System Resources
echo "[1] CHECKING SYSTEM RESOURCES..."
df -h | grep -E '^/dev'
echo "Memory:"
free -h
echo ""

# 2. Check PM2 Status
echo "[2] CHECKING PM2 PROCESSES..."
if command -v pm2 &> /dev/null; then
    pm2 list
else
    echo "❌ PM2 not found!"
fi
echo ""

# 3. Check Teltonika Server Logs (Errors)
echo "[3] CHECKING RECENT ERRORS IN TELTONIKA SERVER..."
if command -v pm2 &> /dev/null; then
    pm2 logs teltonika-server --lines 100 --nostream | grep -iE "error|fail|exception" | tail -n 20
else
    echo "Skipping PM2 logs check."
fi
echo ""


# 3.5 Check Ngrok Tunnel Status
echo "[3.5] CHECKING NGROK TUNNEL..."
if command -v pm2 &> /dev/null; then
    pm2 list | grep ngrok
    echo "--- Ngrok Logs (Last 20 lines) ---"
    pm2 logs ngrok-tunnel --lines 50 --nostream | tail -n 20
else
    echo "Skipping PM2 ngrok check."
fi
echo ""
echo "--- Testing Local Ngrok API ---"
if command -v curl &> /dev/null; then
    curl -s http://localhost:4040/api/tunnels | grep -o "public_url\":\"[^\"]*\"" || echo "Could not access local ngrok API"
else
    echo "curl not found."
fi
echo ""

# 4. Check Network Port 7001
echo "[4] CHECKING PORT 7001 (TELTONIKA)..."
if command -v netstat &> /dev/null; then
    netstat -tuln | grep 7001
else
    echo "netstat not found, trying ss..."
    ss -tuln | grep 7001
fi
echo ""

# 5. Verify Database Connection
echo "[5] VERIFYING DATABASE CONNECTION..."
if [ -f "./scripts/verify_db.ts" ]; then
    npx tsx ./scripts/verify_db.ts
else
    echo "❌ scripts/verify_db.ts not found. Please verify you have the latest scripts."
fi
echo ""

echo "======================================================="
echo "DIAGNOSTIC COMPLETE"
echo "Please take a screenshot or copy this output."
echo "======================================================="
