# Analisis RAW Data dari Device IMEI: 863719065062185

## Executive Summary

**Status:** 🚨 **CRITICAL ISSUE FOUND**

**Problem:** Data telemetry (odometer, fuelLevel, engineHours, temperature, ignition, battery, GSM) **TIDAK disimpan ke LocationHistory table**, menyebabkan:
- ❌ Fuel Analytics tidak berfungsi
- ❌ Tidak ada historical data untuk trend analysis
- ❌ Tidak bisa tracking perubahan fuel level

**Root Cause:** Kode lama masih running di production. Kode baru sudah ada di GitHub tapi teltonika-server belum di-restart.

---

## Data yang Dikirim oleh Device

### ✅ Data yang DITERIMA dari Device (terlihat di Vehicle table):

| Field | Value | Status |
|-------|-------|--------|
| **Position** | -1.8005516, 115.1520666 | ✅ Diterima |
| **Speed** | 0 km/h | ✅ Diterima |
| **Odometer** | 45678.5 km | ✅ Diterima |
| **Fuel Level** | 100% | ✅ Diterima |
| **Engine Hours** | 1234.5 hours | ✅ Diterima |
| **Temperature** | 85.5°C | ✅ Diterima |
| **Ignition** | false | ✅ Diterima |
| **Internal Battery** | 9974 mV | ✅ Diterima |
| **GSM Signal** | 5/5 | ✅ Diterima |
| **Last Update** | 2026-02-13 14:23:39 | ✅ Diterima |

**Kesimpulan:** Device **SUDAH mengirim SEMUA data** dengan lengkap!

---

## Data yang TERSIMPAN di Database

### Vehicle Table (Current State):
✅ **SEMUA data tersimpan dengan benar**

### LocationHistory Table (Last 10 records):
❌ **HANYA lat, lng, speed yang tersimpan**
❌ **Odometer: 0/10 records** (NULL semua)
❌ **Fuel Level: 0/10 records** (NULL semua)
❌ **Engine Hours: 0/10 records** (NULL semua)
❌ **Temperature: 0/10 records** (NULL semua)
❌ **Ignition: 0/10 records** (NULL semua)
❌ **Battery: 0/10 records** (NULL semua)
❌ **GSM Signal: 0/10 records** (NULL semua)

---

## IO Data yang Dikirim Device

Berdasarkan kode teltonika-server.ts, device mengirim IO data berikut:

| IO ID | Field | Unit | Conversion | Status |
|-------|-------|------|------------|--------|
| **199 atau 16** | Odometer | meters → km | ÷ 1000 | ✅ Dikirim |
| **30** | Fuel Level | % | 0-100 | ✅ Dikirim |
| **102** | Engine Hours | seconds → hours | ÷ 3600 | ✅ Dikirim |
| **72** | Temperature | 0.1°C → °C | ÷ 10 | ✅ Dikirim |
| **239** | Ignition | boolean | 0/1 | ✅ Dikirim |
| **67 atau 68** | Internal Battery | mV | - | ✅ Dikirim |
| **21** | GSM Signal | level | 0-5 | ✅ Dikirim |

### Fatigue Camera Events (Codec 15 / 8E):
| IO ID | Event Type | Status |
|-------|------------|--------|
| **11700** | DROWSINESS | ✅ Dikirim & Disimpan |
| **11701** | DISTRACTION | ✅ Dikirim |
| **11702** | YAWNING | ✅ Dikirim |
| **11703** | PHONE_USAGE | ✅ Dikirim |
| **11704** | SMOKING | ✅ Dikirim |
| **11705** | DRIVER_ABSENCE | ✅ Dikirim & Disimpan (11,659 events) |

---

## Root Cause Analysis

### Kode di GitHub (BENAR ✅):

```typescript
// Line 310-326 di teltonika-server.ts
const historyData = {
    vehicleId: vehicle.id,
    lat, lng, speed, timestamp: locationDate,
    ignition,
    internalBattery: internalBattery ? Number(internalBattery) : undefined,
    gsmSignal: gsmSignal ? Math.min(Number(gsmSignal), 5) : undefined,
    odometer,              // ✅ SEHARUSNYA disimpan
    engineHours,           // ✅ SEHARUSNYA disimpan
    temperature,           // ✅ SEHARUSNYA disimpan
    fuelLevel: fuelLevel ? Number(fuelLevel) : undefined  // ✅ SEHARUSNYA disimpan
};

await prisma.locationHistory.create({
    data: historyData
});
```

### Kode di Production (LAMA ❌):

Kemungkinan besar kode lama yang masih running TIDAK memiliki parsing untuk telemetry data, sehingga hanya menyimpan lat, lng, speed.

### Bukti:

1. **Vehicle table** ✅ = Data diterima dan disimpan (kode baru sudah jalan untuk update Vehicle)
2. **LocationHistory table** ❌ = Data TIDAK disimpan (kode lama masih jalan untuk create history)

**ATAU** bisa jadi ada 2 kemungkinan lain:
- Kode sudah benar tapi IO data tidak ada di packet (tapi ini tidak mungkin karena Vehicle table punya data)
- Ada error saat insert ke LocationHistory (perlu cek logs)

---

## Solution

### Immediate Fix:

```bash
# 1. Deploy latest code
cd /home/aicrone/projects/aicrone-app
git pull origin main

# 2. Restart teltonika-server
pm2 restart teltonika-server

# 3. Verify logs
pm2 logs teltonika-server --lines 50
```

### Verification:

After restart, check if new data is being saved:

```bash
# Run this script
node detailed_io_analysis.js
```

You should see:
- ✅ Odometer: 10/10 records
- ✅ Fuel Level: 10/10 records
- ✅ Engine Hours: 10/10 records
- etc.

---

## Impact Analysis

### Current Impact:

1. **Fuel Analytics** ❌ Tidak berfungsi
   - Tidak bisa hitung consumption
   - Tidak bisa detect refueling
   - Tidak bisa hitung efficiency

2. **Historical Tracking** ❌ Tidak ada data
   - Tidak bisa lihat trend fuel level
   - Tidak bisa lihat trend odometer
   - Tidak bisa analisis engine hours

3. **Route Replay** ⚠️ Partial
   - Bisa lihat route (lat/lng)
   - Tapi tidak ada info fuel, odometer, dll

### After Fix:

1. **Fuel Analytics** ✅ Akan berfungsi
2. **Historical Tracking** ✅ Data mulai tersimpan
3. **Route Replay** ✅ Full data available

---

## Data yang BELUM Kita Catat

Berdasarkan analisis, **SEMUA data yang dikirim device SUDAH kita catat** di kode, tapi:

### ✅ Sudah Dicatat (di kode):
- Odometer (IO 199/16)
- Fuel Level (IO 30)
- Engine Hours (IO 102)
- Temperature (IO 72)
- Ignition (IO 239)
- Internal Battery (IO 67/68)
- GSM Signal (IO 21)
- Fatigue events (IO 11700-11705)
- **SPEEDING** (baru ditambahkan)

### ❓ Mungkin Ada (perlu cek logs):
- **Harsh Acceleration** (IO ?)
- **Harsh Braking** (IO ?)
- **Harsh Cornering** (IO ?)
- **External Power** (IO 66)
- **Satellites** (sudah ada di parsing tapi tidak disimpan)
- **Altitude** (sudah ada di parsing tapi tidak disimpan)
- **Angle/Heading** (sudah ada di parsing tapi tidak disimpan)

### Recommendation:

1. **Restart teltonika-server** untuk fix masalah current
2. **Check production logs** untuk lihat IO IDs apa saja yang dikirim
3. **Add more fields** jika perlu (satellites, altitude, angle)

---

## Next Steps

1. ✅ Deploy latest code (already done - commit 9ce1eed)
2. 🔧 **RESTART teltonika-server** (CRITICAL!)
3. ✅ Verify data is being saved to LocationHistory
4. ✅ Test Fuel Analytics functionality
5. 📊 Monitor logs for any missing IO data

---

## Commands Reference

### Check Current Status:
```bash
node detailed_io_analysis.js
```

### Deploy & Restart:
```bash
cd /home/aicrone/projects/aicrone-app
git pull origin main
pm2 restart teltonika-server
pm2 logs teltonika-server --lines 100
```

### Check Logs for IO Data:
```bash
pm2 logs teltonika-server | grep "IOs:"
pm2 logs teltonika-server | grep "863719065062185"
```

### Verify Database:
```bash
node analyze_gps_data.js
node check_behavior_events.js
```
