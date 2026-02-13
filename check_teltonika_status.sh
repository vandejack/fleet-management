#!/bin/bash

echo "=== CHECKING TELTONIKA SERVER STATUS ==="
echo ""

# Check if teltonika-server is running
echo "1. PM2 Process Status:"
pm2 list | grep teltonika

echo ""
echo "2. Recent Logs (Last 50 lines with IO data):"
pm2 logs teltonika-server --lines 100 --nostream | grep -E "(863719065062185|IOs:|DEBUG_V1000)" | tail -50

echo ""
echo "3. Checking for telemetry IO IDs in logs:"
echo "   - IO 199/16 (Odometer)"
echo "   - IO 30 (Fuel Level)"
echo "   - IO 102 (Engine Hours)"
echo "   - IO 72 (Temperature)"
echo "   - IO 239 (Ignition)"
echo "   - IO 67/68 (Battery)"
echo "   - IO 21 (GSM Signal)"

pm2 logs teltonika-server --lines 200 --nostream | grep "863719065062185" | grep -E "(IOs:.*199|IOs:.*30|IOs:.*102|IOs:.*72|IOs:.*239)" | tail -20

echo ""
echo "4. Last restart time:"
pm2 info teltonika-server | grep "uptime"

echo ""
echo "5. Code version check (looking for telemetry parsing):"
grep -n "const odometer = " /home/aicrone/projects/aicrone-app/scripts/teltonika-server.ts | head -1
grep -n "const fuelLevel = " /home/aicrone/projects/aicrone-app/scripts/teltonika-server.ts | head -1
