
const net = require('net');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 7001;
const SNAPSHOT_DIR = path.join(__dirname, '..', 'public', 'snapshots');

if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const server = net.createServer((socket) => {
    console.log('Client connected');

    let imei = '';
    let buffer = Buffer.alloc(0);

    socket.on('data', async (chunk) => {
        try {
            buffer = Buffer.concat([buffer, chunk]);

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
                // Check for preamble
                if (buffer.readUInt32BE(0) !== 0) {
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
                    console.log(`[PARSE] ${imei} | Codec: 0x${codecId.toString(16).toUpperCase()} | Records: ${recordCount} | Size: ${dataLength}`);

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
                            offset += isExt ? 2 : 1; // Event ID
                            offset += isExt ? 2 : 1; // IO Count Total

                            readIOs(isExt, 1);
                            readIOs(isExt, 2);
                            readIOs(isExt, 4);
                            readIOs(isExt, 8);

                            if (isExt) {
                                try {
                                    if (offset + 2 <= data.length) {
                                        const nxCount = data.readUInt16BE(offset); offset += 2;
                                        for (let j = 0; j < nxCount; j++) {
                                            if (offset + 4 > data.length) break;
                                            const id = data.readUInt16BE(offset); offset += 2;
                                            const length = data.readUInt16BE(offset); offset += 2;
                                            if (offset + length > data.length) break;
                                            const valText = data.toString('utf8', offset, offset + length).replace(/[^\x20-\x7E]/g, '');
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
                                if (vehicle) {
                                    await prisma.locationHistory.create({
                                        data: { vehicleId: vehicle.id, lat, lng, speed, timestamp: locationDate }
                                    });

                                    const ignition = ioData[239] !== undefined ? ioData[239] === 1 : undefined;
                                    const internalBattery = ioData[67] || ioData[68];
                                    const gsmSignal = ioData[21];

                                    // NEW: Real Telemetry Parsing
                                    const odometer = (ioData[199] || ioData[16]) ? (Number(ioData[199] || ioData[16]) / 1000) : undefined; // Convert meters to km
                                    const engineHours = ioData[102] ? (Number(ioData[102]) / 3600) : undefined; // Convert seconds to hours
                                    const temperature = ioData[72] ? (Number(ioData[72]) / 10) : undefined; // Often sent in 0.1 units
                                    const fuelLevel = ioData[30]; // 0-100%

                                    await prisma.locationHistory.create({
                                        data: {
                                            vehicleId: vehicle.id,
                                            lat, lng, speed, timestamp: locationDate,
                                            ignition,
                                            internalBattery: internalBattery ? Number(internalBattery) : undefined,
                                            gsmSignal: gsmSignal ? Math.min(Number(gsmSignal), 5) : undefined,
                                            odometer,
                                            engineHours,
                                            temperature,
                                            fuelLevel: fuelLevel ? Number(fuelLevel) : undefined
                                        }
                                    });

                                    await prisma.vehicle.update({
                                        where: { id: vehicle.id },
                                        data: {
                                            currentLocation: { lat, lng, timestamp: locationDate.toISOString() },
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
                                        }
                                    });

                                    const eventMappings: Record<number, string> = {
                                        11700: 'DROWSINESS', 11701: 'DISTRACTION', 11702: 'YAWNING',
                                        11703: 'PHONE_USAGE', 11704: 'SMOKING', 11705: 'DRIVER_ABSENCE'
                                    };

                                    for (const [ioId, eventType] of Object.entries(eventMappings)) {
                                        if (ioData[parseInt(ioId)] === 1) {
                                            await prisma.driverBehaviorEvent.create({
                                                data: { vehicleId: vehicle.id, type: eventType, value: 1, timestamp: locationDate }
                                            });
                                            console.log(`[EVENT] ${eventType} saved`);
                                        }
                                    }
                                }
                            } catch (dbErr) {
                                console.error(`[DB ERROR]`, dbErr.message);
                            }
                        }

                        if (socket.writable) {
                            const response = Buffer.alloc(4);
                            response.writeUInt32BE(recordCount, 0);
                            socket.write(response, (err) => { if (err) console.error('[WRITE ERR]', err.message); });
                        }

                    } else if (codecId === 12 || codecId === 13 || codecId === 15) {
                        const type = data.readUInt8(10);
                        const commandLen = data.readUInt32BE(11);
                        const payload = data.slice(15, 15 + commandLen);

                        if (type === 0x05 || type === 0x06) {
                            const payloadHex = payload.toString('hex');
                            if (payloadHex.includes('ffd8')) {
                                const timestamp = Date.now();
                                const filename = `snapshot_${imei}_${timestamp}.jpg`;
                                const filepath = path.join(SNAPSHOT_DIR, filename);

                                const startIdx = payload.indexOf(Buffer.from([0xff, 0xd8]));
                                if (startIdx !== -1) {
                                    const imageData = payload.slice(startIdx);
                                    fs.writeFileSync(filepath, imageData);
                                    console.log(`[SNAPSHOT] Saved: ${filename}`);

                                    try {
                                        const vehicle = await prisma.vehicle.findUnique({ where: { imei } });
                                        if (vehicle) {
                                            const recentEvent = await prisma.driverBehaviorEvent.findFirst({
                                                where: {
                                                    vehicleId: vehicle.id,
                                                    type: { in: ['DROWSINESS', 'DISTRACTION', 'YAWNING', 'PHONE_USAGE', 'SMOKING', 'DRIVER_ABSENCE'] },
                                                    timestamp: { gte: new Date(Date.now() - 60000) }
                                                },
                                                orderBy: { timestamp: 'desc' }
                                            });
                                            if (recentEvent) {
                                                await prisma.driverBehaviorEvent.update({
                                                    where: { id: recentEvent.id },
                                                    data: { evidenceUrl: `/snapshots/${filename}` }
                                                });
                                                console.log(`[SNAPSHOT] Linked`);
                                            }
                                        }
                                    } catch (err) { }
                                }
                            }
                        }

                        if (socket.writable) {
                            const response = Buffer.alloc(4);
                            response.writeUInt32BE(recordCount, 0);
                            socket.write(response, (err) => { if (err) console.error('[WRITE ERR]', err.message); });
                        }
                    }
                } catch (parseErr) {
                    console.error(`[PARSE ERROR]`, parseErr.message);
                }
            }
        } catch (globalErr) {
            console.error(`[CRITICAL SOCKET ERROR]`, globalErr.message);
        }
    });

    socket.on('end', () => console.log(`Client ${imei || 'unknown'} disconnected`));
    socket.on('error', (err) => {
        if ((err as any).code !== 'ECONNRESET' && (err as any).code !== 'EPIPE') {
            console.error(`Socket error:`, err.message);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Teltonika TCP Server listening on port ${PORT}`);
});
