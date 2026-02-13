# Post-Restart Verification Guide

## Step-by-Step Deployment & Verification

### 1. Deploy Latest Code

```bash
ssh aicrone@192.168.1.101
cd /home/aicrone/projects/aicrone-app

# Pull latest code
git fetch origin
git pull origin main

# You should see these commits:
# - ad2295b: Fuel analytics implementation
# - d70ad84: Fix TypeScript errors
# - 9ce1eed: Add speeding event logging
```

### 2. Restart Teltonika Server

```bash
# Restart the server
pm2 restart teltonika-server

# Check restart was successful
pm2 info teltonika-server

# You should see:
# - status: online
# - uptime: just restarted (few seconds)
# - restarts: increased by 1
```

### 3. Monitor Logs

```bash
# Watch logs in real-time
pm2 logs teltonika-server --lines 50

# Look for these messages:
# [DEBUG_HIST] Creating history for 863719065062185 @ ...
# [DEBUG_HIST] Success
# [EVENT] SPEEDING (105 km/h) saved for driver ...
# [EVENT] DRIVER_ABSENCE saved for driver ...
```

### 4. Wait for Device Data

**IMPORTANT:** Wait at least 2-3 minutes for the device to send new GPS data.

The device sends data every ~30 seconds, so you need to wait for fresh data to arrive after the restart.

### 5. Run Verification Script

```bash
# On your local machine
node verify_after_restart.js
```

### Expected Output (SUCCESS):

```
===========================================
  VERIFICATION AFTER TELTONIKA RESTART
===========================================

Vehicle: Pajero (DA-1281-PZ)
IMEI: 863719065062185

===========================================
  TEST 1: TELEMETRY DATA IN LOCATION HISTORY
===========================================

Found 3 records in last 5 minutes

Record 1 - 2026-02-13T14:30:00.000Z
  Position: -1.8005516, 115.1520666
  Speed: 45 km/h
  ✅ Odometer: 45680.2 km
  ✅ Fuel Level: 98%
  ✅ Engine Hours: 1234.6 hrs
  ✅ Temperature: 85.5°C
  ✅ Ignition: true
  ✅ Battery: 9974 mV
  ✅ GSM Signal: 5

Summary:
  Odometer: 3/3 ✅ WORKING
  Fuel Level: 3/3 ✅ WORKING
  Engine Hours: 3/3 ✅ WORKING
  Temperature: 3/3 ✅ WORKING
  Ignition: 3/3 ✅ WORKING
  Battery: 3/3 ✅ WORKING
  GSM Signal: 3/3 ✅ WORKING

===========================================
  TEST 2: SPEEDING EVENTS
===========================================

Found 2 SPEEDING events in last 5 minutes

✅ Event 1:
   Time: 2026-02-13T14:29:30.000Z
   Speed: 105 km/h
   Driver ID: cml...

===========================================
  FINAL VERDICT
===========================================

✅ SUCCESS! TELEMETRY DATA IS NOW BEING SAVED!
   - LocationHistory now contains telemetry data
   - Fuel Analytics will now work
   - Historical tracking is active
```

### Expected Output (STILL WAITING):

```
===========================================
  TEST 1: TELEMETRY DATA IN LOCATION HISTORY
===========================================

Found 0 records in last 5 minutes

⚠️  No new data in last 5 minutes. Wait for device to send data.

===========================================
  FINAL VERDICT
===========================================

⏳ WAITING FOR DATA
   No new GPS data in last 5 minutes.
   Please wait for device to send data, then run this script again.
```

**Action:** Wait 2-3 more minutes and run the script again.

### Expected Output (STILL BROKEN):

```
===========================================
  TEST 1: TELEMETRY DATA IN LOCATION HISTORY
===========================================

Found 3 records in last 5 minutes

Record 1 - 2026-02-13T14:30:00.000Z
  Position: -1.8005516, 115.1520666
  Speed: 45 km/h
  ❌ Odometer: NULL
  ❌ Fuel Level: NULL
  ❌ Engine Hours: NULL
  ...

Summary:
  Odometer: 0/3 ❌ STILL MISSING
  Fuel Level: 0/3 ❌ STILL MISSING
  ...

===========================================
  FINAL VERDICT
===========================================

❌ STILL BROKEN
   - Telemetry data still NULL in LocationHistory
   - Possible causes:
     1. teltonika-server not restarted yet
     2. Old code still running
     3. Device not sending IO data

   Next steps:
     1. Check: pm2 logs teltonika-server
     2. Verify: pm2 info teltonika-server (check restart time)
     3. Confirm: git pull was successful
```

**Action:** Check the troubleshooting steps below.

---

## Troubleshooting

### Issue 1: "No new data in last 5 minutes"

**Cause:** Device hasn't sent data yet.

**Solution:** 
- Wait 2-3 more minutes
- Check if device is online and has GPS signal
- Check if ignition is ON

### Issue 2: "Telemetry data still NULL"

**Cause:** Old code still running.

**Solution:**
```bash
# Check PM2 restart time
pm2 info teltonika-server | grep uptime

# If uptime is old (hours/days), restart didn't work
pm2 restart teltonika-server --update-env

# Force restart
pm2 delete teltonika-server
cd /home/aicrone/projects/aicrone-app
pm2 start npm --name "teltonika-server" -- run teltonika
```

### Issue 3: "Git pull didn't get new commits"

**Cause:** Git pull failed or wrong branch.

**Solution:**
```bash
# Check current commit
git log -1 --oneline

# Should show: 9ce1eed fix: add speeding event logging

# If not, force pull
git fetch origin
git reset --hard origin/main
```

### Issue 4: "Device not sending IO data"

**Cause:** Device configuration issue.

**Solution:**
```bash
# Check raw logs for IO data
pm2 logs teltonika-server | grep "IOs:"

# Look for IO IDs: 199, 30, 102, 72, 239, 67, 21
# If these IOs are missing, device needs reconfiguration
```

---

## Quick Commands Reference

```bash
# Deploy
cd /home/aicrone/projects/aicrone-app && git pull origin main && pm2 restart teltonika-server

# Check logs
pm2 logs teltonika-server --lines 100

# Verify (on local machine)
node verify_after_restart.js

# Check PM2 status
pm2 info teltonika-server

# Force restart
pm2 restart teltonika-server --update-env
```

---

## What to Expect After Successful Restart

1. **Fuel Analytics Page** (`/analytics`)
   - Will show real data
   - Charts will populate
   - Refueling events will be detected

2. **Driver Behavior Events**
   - SPEEDING events will be logged
   - Can see in database and web interface

3. **Route Replay**
   - Will show fuel level changes
   - Odometer readings
   - Engine hours

4. **Historical Data**
   - Can track fuel consumption over time
   - Can analyze efficiency trends
   - Can see refueling patterns

---

## Success Criteria

✅ Telemetry data appears in LocationHistory (odometer, fuelLevel, etc.)
✅ SPEEDING events are being logged to database
✅ Fuel Analytics page shows real data
✅ No NULL values in recent LocationHistory records
✅ PM2 logs show successful data insertion

---

## Need Help?

If verification fails after following all troubleshooting steps:

1. Share PM2 logs: `pm2 logs teltonika-server --lines 200 > logs.txt`
2. Share verification output: `node verify_after_restart.js > verify.txt`
3. Check git status: `git log -5 --oneline`
