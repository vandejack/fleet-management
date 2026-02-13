# Speeding Event Logging Fix - Summary

## Problem Identified

**Issue:** Only DRIVER_ABSENCE events were being saved to the database, while speeding alerts were showing on the web interface but NOT being saved.

**Root Cause:** The `teltonika-server.ts` code was:
- ✅ Sending push notifications for speeding (speed > 100 km/h)
- ❌ NOT saving SPEEDING events to `DriverBehaviorEvent` table

**Database Evidence:**
- Vehicle: Pajero (DA-1281-PZ), IMEI: 863719065062185
- **11,659 DRIVER_ABSENCE events** saved ✅
- **1 DROWSINESS event** saved ✅
- **Only 1 SPEEDING event** (manually created) ❌

## Solution Implemented

**File Modified:** `scripts/teltonika-server.ts`

**Changes:**
Added code to save SPEEDING events to the database when speed exceeds threshold (100 km/h):

```typescript
// Save SPEEDING event to database
if (speed > SPEED_THRESHOLD) {
    sendSpeedingNotification(vehicle, speed, locationDate);
    
    // Save speeding event to database
    if (vehicle.driverId) {
        try {
            await prisma.driverBehaviorEvent.create({
                data: {
                    vehicleId: vehicle.id,
                    driverId: vehicle.driverId,
                    type: 'SPEEDING',
                    value: speed,
                    timestamp: locationDate
                }
            });
            console.log(`[EVENT] SPEEDING (${speed} km/h) saved for driver ${vehicle.driverId}`);
        } catch (eventErr) {
            console.error(`[EVENT ERROR] Failed to save SPEEDING event:`, eventErr);
        }
    } else {
        console.warn(`[EVENT] SPEEDING detected but no driver assigned to vehicle ${vehicle.id}`);
    }
}
```

**Key Features:**
- Saves event type as 'SPEEDING'
- Stores actual speed value (not just 1)
- Uses GPS timestamp from device
- Requires driver to be assigned to vehicle
- Logs success/failure for debugging

## Deployment to Production

**Commit:** `9ce1eed`
**Branch:** `main`

### Deployment Commands

```bash
ssh aicrone@192.168.1.101
cd /home/aicrone/projects/aicrone-app

# Pull latest changes
git fetch origin
git reset --hard origin/main

# Restart teltonika-server (no rebuild needed - it's TypeScript)
pm2 restart teltonika-server

# Check logs
pm2 logs teltonika-server --lines 50
```

## Verification Steps

### 1. Check Server Logs

After deployment, monitor the teltonika-server logs for speeding events:

```bash
pm2 logs teltonika-server | grep SPEEDING
```

You should see messages like:
```
[EVENT] SPEEDING (105 km/h) saved for driver cml...
```

### 2. Query Database

Run this script to check if SPEEDING events are being saved:

```javascript
// check_behavior_events.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEvents() {
    const vehicle = await prisma.vehicle.findFirst({
        where: { imei: '863719065062185' }
    });
    
    const speedingEvents = await prisma.driverBehaviorEvent.findMany({
        where: { 
            vehicleId: vehicle.id,
            type: 'SPEEDING'
        },
        orderBy: { timestamp: 'desc' },
        take: 10
    });
    
    console.log('Recent Speeding Events:', speedingEvents);
    await prisma.$disconnect();
}

checkEvents();
```

### 3. Check Web Interface

Navigate to the driver behavior monitoring page and verify that SPEEDING events now appear alongside DRIVER_ABSENCE events.

## Expected Behavior After Fix

**Before:**
- Speeding alerts shown on web interface ✅
- Push notifications sent ✅
- Database records: ❌ (only DRIVER_ABSENCE)

**After:**
- Speeding alerts shown on web interface ✅
- Push notifications sent ✅
- Database records: ✅ (SPEEDING + DRIVER_ABSENCE + other events)

## Configuration

**Speed Threshold:** 100 km/h (defined in `teltonika-server.ts` line 21)

To change the threshold, modify:
```typescript
const SPEED_THRESHOLD = 100; // km/h
```

## Notes

- **Requires Driver Assignment:** Speeding events will only be saved if a driver is assigned to the vehicle
- **Real-time Logging:** Events are saved immediately when GPS data is received
- **No Database Migration Needed:** Uses existing `DriverBehaviorEvent` table structure
- **Backward Compatible:** Doesn't affect existing fatigue camera event logging

## Testing Checklist

- [ ] Deploy to production server
- [ ] Restart teltonika-server via PM2
- [ ] Monitor logs for SPEEDING event messages
- [ ] Drive vehicle above 100 km/h
- [ ] Verify push notification is received
- [ ] Check database for new SPEEDING records
- [ ] Verify events appear on web interface

---

**Status:** ✅ Fixed and pushed to GitHub
**Deployed:** Pending production deployment
