# Production Deployment Commands

## Quick Force Deploy (Recommended)

Run these commands on the production server to force update to the latest code:

```bash
ssh aicrone@192.168.1.101
cd /home/aicrone/projects/aicrone-app

# Force reset to GitHub version (discards local changes)
git fetch origin
git reset --hard origin/main
git clean -fd

# Install dependencies and build
npm ci
npx prisma generate
npm run build

# Restart services
pm2 restart fleet-management
pm2 restart teltonika-server

# Check status
pm2 status
pm2 logs fleet-management --lines 50
```

## What's Been Deployed to GitHub

**Commit:** `ad2295b`
**Branch:** `main`

### Changes Included:
1. ✅ Complete fuel analytics implementation (`src/lib/actions/fuel-analytics.ts`)
2. ✅ Updated analytics UI (`src/app/analytics/page.tsx`)
3. ✅ Fixed module export errors (removed re-exports from `actions.ts`)
4. ✅ Fixed Turbopack font errors (commented out Cinzel imports)

### New Features:
- Automatic fuel consumption tracking from GPS data
- Auto refueling detection (>10% fuel level increase)
- Fuel efficiency calculations (km/L)
- Cost estimation (Rp 14,500/L default)
- Daily consumption trends
- Real-time updates (10-second polling)

## Mandatory GPS Data Requirements

The fuel analytics system requires these fields in `LocationHistory`:
- `odometer` (Float, km) - for distance tracking
- `fuelLevel` (Float, %) - for consumption & refueling detection
- `timestamp` (DateTime) - for time-series analysis
- `vehicleId` (String) - for vehicle grouping

## Verification After Deployment

1. Check the app is running:
   ```bash
   curl http://localhost:3000
   ```

2. Test the analytics page:
   ```bash
   curl http://localhost:3000/analytics
   ```

3. Check PM2 logs for errors:
   ```bash
   pm2 logs fleet-management --lines 100
   ```

4. Access via browser:
   - https://fms.aicrone.id/analytics

## Troubleshooting

If you encounter issues:

1. **Build errors:** Check Node.js version (should be v20)
   ```bash
   node -v
   nvm use 20
   ```

2. **Database errors:** Regenerate Prisma client
   ```bash
   npx prisma generate
   ```

3. **Port conflicts:** Check what's using port 3000
   ```bash
   lsof -i :3000
   ```

4. **PM2 issues:** Restart PM2
   ```bash
   pm2 kill
   pm2 start npm --name "fleet-management" -- start
   ```

## Local Development Status

✅ All changes committed and pushed to GitHub
✅ Local server running successfully on `http://localhost:3000`
✅ No build errors
✅ Ready for production deployment

---

**Note:** The force reset will discard any local changes on the server (like the files shown in the conflict: `scripts/teltonika-server.ts`, `simulate_speeding.js`, `assign_company.js`, `check_tokens.js`, `debug_query.js`). Make sure you don't need those changes before proceeding.
