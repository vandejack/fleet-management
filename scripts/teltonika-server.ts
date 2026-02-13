import net from 'net';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

import { PrismaClient } from '@prisma/client';
import * as admin from 'firebase-admin';

const PORT = Number(process.env.PORT) || 7001;
const SNAPSHOT_DIR = path.join(__dirname, '..', 'public', 'snapshots');

if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
}

const prisma = new PrismaClient();

// Speeding configuration
const SPEED_THRESHOLD = 100; // km/h
const NOTIFICATION_COOLDOWN = 5 * 60 * 1000; // 5 minutes
const lastNotificationSent = new Map(); // IMEI -> timestamp

// Initialize Firebase Admin if possible
const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');

if (fs.existsSync(serviceAccountPath) && !admin.apps.length) {
    try {
        console.log(`[FIREBASE] Loading service account from: ${serviceAccountPath}`);
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        console.log(`[FIREBASE] Private Key length: ${serviceAccount.private_key?.length}`);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin initialized successfully from JSON object');
    } catch (e: any) {
        console.error('Firebase initialization error:', e.message);
        if (e.stack) console.error(e.stack);
    }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT && !admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin initialized using environment variable');
    } catch (e: any) {
        console.error('Firebase environment variable initialization error:', e.message);
    }
}

async function sendSpeedingNotification(vehicle: any, speed: number, timestamp: Date) {
    if (!admin.apps.length) return;

    const cooldownKey = vehicle.imei;
    const now = Date.now();
    const lastSent = lastNotificationSent.get(cooldownKey) || 0;

    if (now - lastSent < NOTIFICATION_COOLDOWN) {
        return;
    }

    try {
        // Find users for the company to send notifications to
        console.log(`[PUSH_DEBUG] Finding users for companyId: ${vehicle.companyId}`);
        const users = await prisma.user.findMany({
            where: { companyId: vehicle.companyId },
            include: { pushTokens: true }
        });
        console.log(`[PUSH_DEBUG] Found ${users.length} users.`);

        const allTokens = users.flatMap((u: any) => u.pushTokens.map((t: any) => t.token));

        if (allTokens.length > 0) {
            const message: admin.messaging.MulticastMessage = {
                tokens: allTokens,
                notification: {
                    title: `⚠️ Speeding Alert: ${vehicle.name}`,
                    body: `${vehicle.name} (${vehicle.plate}) is traveling at ${speed} km/h.`,
                },
                data: {
                    type: 'speeding',
                    vehicleId: vehicle.id,
                    speed: speed.toString(),
                    timestamp: timestamp.toISOString()
                },
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        clickAction: 'FCM_PLUGIN_ACTIVITY',
                    },
                },
            };

            const response = await admin.messaging().sendEachForMulticast(message);
            console.log(`[PUSH] Speeding notification sent for ${vehicle.name}: ${response.successCount} success, ${response.failureCount} failure`);
            lastNotificationSent.set(cooldownKey, now);

            // Cleanup invalid tokens
            if (response.failureCount > 0) {
                const tokensToRemove: string[] = [];
                response.responses.forEach((res: any, idx: number) => {
                    if (!res.success && res.error &&
                        (res.error.code === 'messaging/invalid-registration-token' ||
                            res.error.code === 'messaging/registration-token-not-registered')) {
                        tokensToRemove.push(allTokens[idx]);
                    }
                });
                if (tokensToRemove.length > 0) {
                    await prisma.pushToken.deleteMany({
                        where: { token: { in: tokensToRemove } }
                    });
                }
            }
        }
    } catch (err: any) {
        console.error('[PUSH ERROR] Failed to send speeding notification:', err.message);
    }
}

const server = net.createServer((socket: any) => {
    console.log('ANTIGRAVITY STABILIZED SERVER v999 STARTING');
    console.log('Client connected');

    let imei = '';
    let buffer = Buffer.alloc(0);

    socket.on('data', async (chunk: Buffer) => {
        try {
            buffer = Buffer.concat([buffer, chunk]);

            // DEBUG: Log raw incoming data to see what the device is sending
            console.log(`[RAW] Received ${chunk.length} bytes from ${socket.remoteAddress}: ${chunk.toString('hex')}`);

            // 1. IMEI Handshake
            if (!imei) {
                if (buffer.length < 2) return;
                const length = buffer.readUInt16BE(0);
                if (buffer.length < 2 + length) return;

                imei = buffer.slice(2, 2 + length).toString('ascii');
                buffer = buffer.slice(2 + length);

                console.log(`Device IMEI: ${imei}`);
                if (socket.writable) {
                    const response = Buffer.alloc(1);
                    response.writeUInt8(1, 0);
                    socket.write(response);
                }
                return;
            }

            // 2. AVL Data Parsing (Loop in case multiple packets are in buffer)
            while (buffer.length >= 12) {
                // Check for Preamble (0x00000000) -> Data Packet
                const isDataPacket = buffer.readUInt32BE(0) === 0;

                if (!isDataPacket) {
                    // If NOT data packet, check if it's a re-login (IMEI)
                    // IMEI Packet: 2 bytes length + IMEI string
                    if (buffer.length >= 2) {
                        const imeiLen = buffer.readUInt16BE(0);
                        // Sanity check: IMEI usually 15 chars, maybe a bit more/less. 
                        // If length is reasonable (e.g., 10-25) and buffer has enough data
                        if (imeiLen > 0 && imeiLen < 50 && buffer.length >= 2 + imeiLen) {
                            try {
                                const newImei = buffer.slice(2, 2 + imeiLen).toString('ascii');
                                // Verify if it looks like an IMEI (digits)
                                if (/^\d+$/.test(newImei)) {
                                    console.log(`[INFO] Re-login / Handshake detected for IMEI: ${newImei}`);
                                    imei = newImei;

                                    // Send 1 for Accept
                                    if (socket.writable) {
                                        const response = Buffer.alloc(1);
                                        response.writeUInt8(1, 0);
                                        socket.write(response);
                                    }

                                    // Consume packet
                                    buffer = buffer.slice(2 + imeiLen);
                                    continue;
                                }
                            } catch (e) { }
                        }
                    }

                    // If not valid data preamble AND not valid IMEI -> Skip 1 byte (Sync)
                    buffer = buffer.slice(1);
                    continue;
                }

                const dataLength = buffer.readUInt32BE(4);
                const totalPacketLength = dataLength + 12; // 4 Preamble + 4 Len + L + 4 CRC

                if (buffer.length < totalPacketLength) break;

                const data = buffer.slice(0, totalPacketLength);
                buffer = buffer.slice(totalPacketLength);

                try {
                    const codecId = data.readUInt8(8);
                    const recordCount = data.readUInt8(9);

                    if (codecId === 0) {
                        console.log(`[WARN] Codec 0 Detected from ${imei}. Dump: ${data.toString('hex')}`);
                    } else {
                        console.log(`[PARSE] ${imei} | Codec: 0x${codecId.toString(16).toUpperCase()} | Records: ${recordCount} | Size: ${dataLength}`);
                    }

                    if (codecId === 0x08 || codecId === 0x8E) {
                        let offset = 10;
                        for (let i = 0; i < recordCount; i++) {
                            if (offset + 15 > data.length) break;

                            const timestamp = data.readBigUInt64BE(offset); offset += 8;
                            const timestampNum = Number(timestamp);
                            const locationDate = new Date(timestampNum);

                            if (isNaN(locationDate.getTime()) || locationDate.getFullYear() > 2100 || locationDate.getFullYear() < 2020) {
                                console.error(`[SKIP] Invalid Timestamp for ${imei}: ${timestampNum}`);
                                break;
                            }

                            const priority = data.readUInt8(offset); offset += 1;
                            const lng = data.readInt32BE(offset) / 10000000; offset += 4;
                            const lat = data.readInt32BE(offset) / 10000000; offset += 4;
                            const altitude = data.readInt16BE(offset); offset += 2;
                            const angle = data.readUInt16BE(offset); offset += 2;
                            const satellites = data.readUInt8(offset); offset += 1;
                            const speed = data.readUInt16BE(offset); offset += 2;

                            let ioData: Record<number, number> = {};

                            const readIOs = (isExtended: boolean, bytes: number) => {
                                if (offset >= data.length) return;
                                const count = isExtended ? data.readUInt16BE(offset) : data.readUInt8(offset);
                                offset += isExtended ? 2 : 1;
                                for (let j = 0; j < count; j++) {
                                    if (offset + (isExtended ? 2 : 1) + bytes > data.length) break;
                                    const id = isExtended ? data.readUInt16BE(offset) : data.readUInt8(offset);
                                    offset += isExtended ? 2 : 1;
                                    const val = bytes === 1 ? data.readInt8(offset) :
                                        bytes === 2 ? data.readInt16BE(offset) :
                                            bytes === 4 ? data.readInt32BE(offset) :
                                                Number(data.readBigInt64BE(offset));
                                    offset += bytes;
                                    ioData[id] = val;
                                }
                            };

                            const isExt = (codecId === 0x8E);
                            console.log(`[DEBUG_V1000] ${imei} Codec: ${codecId.toString(16)}, AVL Part Hex: ${data.slice(offset, offset + 20).toString('hex')}`);
                            offset += isExt ? 2 : 1; // Event ID
                            offset += isExt ? 2 : 1; // IO Count Total

                            readIOs(isExt, 1);
                            readIOs(isExt, 2);
                            readIOs(isExt, 4);
                            readIOs(isExt, 8);

                            console.log(`[DEBUG_V1000] ${imei} Rec${i} IOs:`, Object.keys(ioData).join(', '));
                            console.log(`[DEBUG_V1000] Offset: ${offset}, DataLen: ${data.length}, isExt: ${isExt}`);

                            if (isExt) {
                                try {
                                    if (offset + 2 <= data.length) {
                                        const nxCount = data.readUInt16BE(offset); offset += 2;
                                        console.log(`[DEBUG_V1000] ${imei} Codec 8E VL IO Count: ${nxCount}`);
                                        for (let j = 0; j < nxCount; j++) {
                                            if (offset + 4 > data.length) break;
                                            const id = data.readUInt16BE(offset); offset += 2;
                                            const length = data.readUInt16BE(offset); offset += 2;
                                            if (offset + length > data.length) break;
                                            const valText = data.toString('utf8', offset, offset + length).replace(/[^\x20-\x7E]/g, '');
                                            console.log(`[DEBUG_V1000] VL IO ID: ${id}, Len: ${length}, Val: "${valText}"`);
                                            offset += length;
                                            ioData[id] = 1;
                                            if (valText.includes('Absence')) ioData[11705] = 1;
                                            if (valText.includes('Drowsiness')) ioData[11700] = 1;
                                            if (valText.includes('Distraction')) ioData[11701] = 1;
                                            if (valText.includes('Yawning')) ioData[11702] = 1;
                                            if (valText.includes('Smoking')) ioData[11704] = 1;
                                            if (valText.includes('Phone')) ioData[11703] = 1;
                                        }
                                    }
                                } catch (e) { }
                            }

                            try {
                                const vehicle = await prisma.vehicle.findUnique({ where: { imei } });
                                if (vehicle && (lat !== 0 || lng !== 0)) {
                                    const ignition = ioData[239] !== undefined ? ioData[239] === 1 : undefined;
                                    const internalBattery = ioData[67] || ioData[68];
                                    const gsmSignal = ioData[21];

                                    console.log(`[DEBUG_V1000] ${imei} Vehicle Found, saving data...`);

                                    // NEW: Real Telemetry Parsing
                                    const odometer = (ioData[199] || ioData[16]) ? (Number(ioData[199] || ioData[16]) / 1000) : undefined; // Convert meters to km
                                    const engineHours = ioData[102] ? (Number(ioData[102]) / 3600) : undefined; // Convert seconds to hours
                                    const temperature = ioData[72] ? (Number(ioData[72]) / 10) : undefined; // Often sent in 0.1 units
                                    const fuelLevel = ioData[30]; // 0-100%


                                    // Debug LocationHistory payload
                                    const historyData = {
                                        vehicleId: vehicle.id,
                                        lat, lng, speed, timestamp: locationDate,
                                        ignition,
                                        internalBattery: internalBattery ? Number(internalBattery) : undefined,
                                        gsmSignal: gsmSignal ? Math.min(Number(gsmSignal), 5) : undefined,
                                        odometer,
                                        engineHours,
                                        temperature,
                                        fuelLevel: fuelLevel ? Number(fuelLevel) : undefined
                                    };
                                    console.log(`[DEBUG_HIST] Creating history for ${imei} @ ${locationDate.toISOString()}`);

                                    await prisma.locationHistory.create({
                                        data: historyData
                                    });
                                    console.log(`[DEBUG_HIST] Success`);

                                    // Check if this data is newer than what we have on the vehicle
                                    // If vehicle has no lastLocationTime, or new date is newer, or same date but let's assume update
                                    const isNewer = !vehicle.lastLocationTime || locationDate > vehicle.lastLocationTime;

                                    if (isNewer) {
                                        const updateData = {
                                            lat,
                                            lng,
                                            speed,
                                            status: ignition === false ? 'stopped' : speed > 5 ? 'moving' : 'idle',
                                            lastLocationTime: locationDate,
                                            ignition,
                                            internalBattery: internalBattery ? Number(internalBattery) : undefined,
                                            gsmSignal: gsmSignal ? Math.min(Number(gsmSignal), 5) : undefined,
                                            odometer: odometer || undefined,
                                            engineHours: engineHours || undefined,
                                            temperature: temperature || undefined,
                                            fuelLevel: fuelLevel ? Number(fuelLevel) : undefined
                                        };

                                        console.log(`[DEBUG_UPDATE] Updating ${imei} (Newer Data) | Data keys: ${Object.keys(updateData).join(',')}`);

                                        try {
                                            await prisma.vehicle.update({
                                                where: { id: vehicle.id },
                                                data: updateData
                                            });
                                            console.log(`[DEBUG_UPDATE] SUCCESS for ${imei}`);

                                            if (speed > SPEED_THRESHOLD) {
                                                sendSpeedingNotification(vehicle, speed, locationDate);
                                            }
                                        } catch (updateErr: any) {
                                            console.error(`[DEBUG_UPDATE] FAILED for ${imei}:`, updateErr.message);
                                        }
                                    } else {
                                        console.log(`[DEBUG_UPDATE] SKIPPING Update for ${imei} - Data (Feb 5/Old) is older than current Vehicle state.`);
                                    }

                                    const eventMappings: Record<number, string> = {
                                        11700: 'DROWSINESS', 11701: 'DISTRACTION', 11702: 'YAWNING',
                                        11703: 'PHONE_USAGE', 11704: 'SMOKING', 11705: 'DRIVER_ABSENCE'
                                    };

                                    for (const [ioId, eventType] of Object.entries(eventMappings)) {
                                        if (ioData[parseInt(ioId)] === 1) {
                                            if (vehicle.driverId) {
                                                try {
                                                    await prisma.driverBehaviorEvent.create({
                                                        data: {
                                                            vehicleId: vehicle.id,
                                                            driverId: vehicle.driverId,
                                                            type: eventType,
                                                            value: 1,
                                                            timestamp: locationDate
                                                        }
                                                    });
                                                    console.log(`[EVENT] ${eventType} saved for driver ${vehicle.driverId}`);
                                                } catch (eventErr) {
                                                    console.error(`[EVENT ERROR] Failed to save ${eventType}:`, eventErr);
                                                }
                                            } else {
                                                console.warn(`[EVENT] ${eventType} detected but no driver assigned to vehicle ${vehicle.id}`);
                                            }
                                        }
                                    }
                                }
                            } catch (dbErr) {
                                console.error(`[DB ERROR] Full Trace:`, dbErr);
                            }
                        }

                        if (socket.writable) {
                            const response = Buffer.alloc(4);
                            response.writeUInt32BE(recordCount, 0);
                            socket.write(response, (err: any) => { if (err) console.error('[WRITE ERR]', err.message); });
                        }

                    } else if (codecId === 12 || codecId === 13 || codecId === 15) {
                        const type = data.readUInt8(10);
                        const commandLen = data.readUInt32BE(11);
                        const payload = data.slice(15, 15 + commandLen);

                        if (type === 0x05 || type === 0x06) {
                            // Check for Text Events first
                            const textPayload = payload.toString('utf8').replace(/[^\x20-\x7E]/g, '');
                            const eventMappings: Record<string, string> = {
                                'Absence': 'DRIVER_ABSENCE',
                                'Drowsiness': 'DROWSINESS',
                                'Distraction': 'DISTRACTION',
                                'Yawning': 'YAWNING',
                                'Smoking': 'SMOKING',
                                'Phone': 'PHONE_USAGE'
                            };

                            let eventFound = false;
                            for (const [keyword, eventType] of Object.entries(eventMappings)) {
                                if (textPayload.includes(keyword)) {
                                    eventFound = true;
                                    console.log(`[EVENT DETECTED from TEXT] ${eventType} found in "${textPayload}"`);

                                    try {
                                        const vehicle = await prisma.vehicle.findUnique({ where: { imei } });
                                        if (vehicle && vehicle.driverId) {
                                            await prisma.driverBehaviorEvent.create({
                                                data: {
                                                    vehicleId: vehicle.id,
                                                    driverId: vehicle.driverId,
                                                    type: eventType,
                                                    value: 1,
                                                    timestamp: new Date() // Use current server time for text events as they lack GPS timestamp usually
                                                }
                                            });
                                            console.log(`[EVENT SAVED] ${eventType} saved to DB.`);
                                        } else {
                                            console.warn(`[EVENT WARNING] Vehicle/Driver not found for event ${eventType}`);
                                        }
                                    } catch (dbErr) {
                                        console.error(`[EVENT ERROR] Failed to save text event:`, dbErr);
                                    }
                                }
                            }

                            if (!eventFound) {
                                // Save as snapshot only if NOT a known text event
                                const filename = `${imei}_${Date.now()}_${type}.bin`;
                                const filepath = path.join(SNAPSHOT_DIR, filename);
                                try {
                                    fs.writeFileSync(filepath, payload);
                                    console.log(`[INFO] Codec 15 (Snapshot) received & SAVED: ${filename} (${payload.length} bytes)`);
                                } catch (e) {
                                    console.error(`[ERROR] Failed to save snapshot:`, e);
                                }
                            }
                        }


                        if (socket.writable) {
                            const response = Buffer.alloc(4);
                            response.writeUInt32BE(recordCount, 0);
                            socket.write(response, (err: any) => { if (err) console.error('[WRITE ERR]', err.message); });
                        }
                    }
                } catch (parseErr: any) {
                    console.error(`[PARSE ERROR]`, parseErr.message);
                }
            }
        } catch (globalErr: any) {
            console.error(`[CRITICAL SOCKET ERROR]`, globalErr.message);
        }
    });

    socket.on('end', () => console.log(`Client ${imei || 'unknown'} disconnected`));
    socket.on('error', (err: any) => {
        if (err.code !== 'ECONNRESET' && err.code !== 'EPIPE') {
            console.error(`Socket error:`, err.message);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Teltonika TCP Server listening on port ${PORT}`);
});
