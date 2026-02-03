

const net = require('net');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 7001;
const SNAPSHOT_DIR = path.join(__dirname, '..', 'public', 'snapshots');

if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
}

// Helper to parse Teltonika IO Elements
function parseIoElements(buffer: Buffer, offset: number) {
    // Teltonika IO parsing logic is complex, simplified here for structure
    // See Codec 8 doc for full spec
    return { offset: offset, elements: [] };
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const server = net.createServer((socket) => {
    console.log('Client connected');

    let imei = '';

    socket.on('data', async (data) => {
        console.log('Received data:', data.toString('hex'));

        // 1. IMEI Handshake
        if (!imei) {
            const length = data.readUInt16BE(0);
            imei = data.toString('ascii', 2, 2 + length);
            console.log(`Device IMEI: ${imei}`);
            const response = Buffer.alloc(1);
            response.writeUInt8(1, 0);
            socket.write(response);
            return;
        }

        // 2. AVL Data Parsing
        console.log(`[RAW] Length: ${data.length}, Hex: ${data.toString('hex')}`);

        if (data.length > 10 && data.readUInt32BE(0) === 0) {
            const dataLength = data.readUInt32BE(4);
            const codecId = data.readUInt8(8);

            console.log(`[PARSE] Codec ID: 0x${codecId.toString(16).toUpperCase()}, DataLen: ${dataLength}`);

            if (codecId === 0x08 || codecId === 0x8E) {
                const recordCount = data.readUInt8(9);
                console.log(`[PARSE] Records: ${recordCount}`);
                let offset = 10;
                const records = [];

                for (let i = 0; i < recordCount; i++) {
                    const timestamp = data.readBigUInt64BE(offset); offset += 8;
                    const priority = data.readUInt8(offset); offset += 1;
                    const lng = data.readInt32BE(offset) / 10000000; offset += 4;
                    const lat = data.readInt32BE(offset) / 10000000; offset += 4;
                    const altitude = data.readInt16BE(offset); offset += 2;
                    const angle = data.readUInt16BE(offset); offset += 2;
                    const satellites = data.readUInt8(offset); offset += 1;
                    const speed = data.readUInt16BE(offset); offset += 2;

                    let eventIoId = 0;
                    let ioData: Record<number, number> = {};

                    if (codecId === 0x08) {
                        // Codec 8 (1-byte IDs)
                        eventIoId = data.readUInt8(offset); offset += 1;
                        const totalIoCount = data.readUInt8(offset); offset += 1;

                        // Helper to read IOs
                        const readIOs = (bytes) => {
                            const count = data.readUInt8(offset); offset += 1;
                            for (let j = 0; j < count; j++) {
                                const id = data.readUInt8(offset); offset += 1;
                                const val = data.readUIntBE(offset, bytes); offset += bytes;
                                ioData[id] = val;
                            }
                        };
                        readIOs(1); readIOs(2); readIOs(4); readIOs(8);
                    } else if (codecId === 0x8E) {
                        // Codec 8 Extended (2-byte IDs)
                        eventIoId = data.readUInt16BE(offset); offset += 2;
                        const totalIoCount = data.readUInt16BE(offset); offset += 2;

                        const readIOs = (bytes) => {
                            const count = data.readUInt16BE(offset); offset += 2;
                            for (let j = 0; j < count; j++) {
                                const id = data.readUInt16BE(offset); offset += 2;
                                const val = data.readUIntBE(offset, bytes); offset += bytes;
                                ioData[id] = val;
                            }
                        };
                        readIOs(1); readIOs(2); readIOs(4); readIOs(8);

                        // Codec 8E Variable Length IOs (NX bytes)
                        try {
                            const nxCount = data.readUInt16BE(offset); offset += 2;
                            for (let j = 0; j < nxCount; j++) {
                                const id = data.readUInt16BE(offset); offset += 2;
                                const length = data.readUInt16BE(offset); offset += 2;
                                const val = data.toString('hex', offset, offset + length); // Store as hex string for now
                                const valText = data.toString('utf8', offset, offset + length).replace(/[^\x20-\x7E]/g, '');
                                offset += length;
                                ioData[id] = 1; // Mark as present for event detection
                                console.log(`[NX] ID: ${id}, Length: ${length}, Hex: ${val}, Text: ${valText}`);

                                // Map Movon Text to Event Type if found
                                if (valText.includes('Absence')) ioData[11705] = 1;
                                if (valText.includes('Drowsiness')) ioData[11700] = 1;
                                if (valText.includes('Distraction')) ioData[11701] = 1;
                                if (valText.includes('Yawning')) ioData[11702] = 1;
                                if (valText.includes('Smoking')) ioData[11704] = 1;
                                if (valText.includes('Phone')) ioData[11703] = 1;
                            }
                        } catch (e) {
                            // console.log("No NX elements or parsing error");
                        }

                        // Log the IDs received for debugging
                        const keys = Object.keys(ioData);
                        if (keys.some(k => parseInt(k) > 1000)) {
                            console.log(`[DEBUG] High-range IOs found in 8E:`, JSON.stringify(ioData));
                        }
                    }

                    // Process Record
                    try {
                        // Extract telemetry data from IO elements
                        // Common Teltonika IO IDs:
                        const ignition = ioData[239] !== undefined ? ioData[239] === 1 : undefined;
                        const vehicleBattery = ioData[66] !== undefined ? ioData[66] : undefined; // mV
                        const internalBattery = ioData[67] !== undefined ? ioData[67] : undefined; // mV
                        const gsmSignal = ioData[21] !== undefined ? ioData[21] : undefined; // 0-5
                        const odometer = ioData[16] !== undefined ? ioData[16] / 1000 : undefined; // convert m to km
                        const engineHours = ioData[199] !== undefined ? ioData[199] / 3600000 : undefined; // convert ms to hours
                        const fuelLevel = ioData[72] !== undefined ? ioData[72] : undefined; // percentage or raw value
                        const temperature = ioData[72] !== undefined ? ioData[72] : undefined; // °C (ID may vary)

                        // Validate timestamp
                        const timestampNum = Number(timestamp);
                        const locationDate = new Date(timestampNum);

                        if (isNaN(locationDate.getTime())) {
                            console.error(`Invalid timestamp received for ${imei}: ${timestampNum}`);
                            continue;
                        }

                        // Update Vehicle
                        const vehicle = await prisma.vehicle.update({
                            where: { imei },
                            data: {
                                lat, lng, speed,
                                lastLocationTime: locationDate,
                                status: speed > 0 ? 'moving' : 'stopped',
                                // Update telemetry fields
                                ignition,
                                vehicleBattery,
                                internalBattery,
                                gsmSignal,
                                odometer,
                                engineHours,
                                temperature
                            },
                            include: { driver: true }
                        });

                        // Save History with telemetry data
                        await prisma.locationHistory.create({
                            data: {
                                vehicleId: vehicle.id, lat, lng, speed, heading: angle,
                                timestamp: new Date(Number(timestamp)),
                                // Save telemetry data to history
                                ignition,
                                vehicleBattery,
                                internalBattery,
                                gsmSignal,
                                odometer,
                                engineHours,
                                fuelLevel,
                                temperature
                            }
                        });

                        // Check Speeding
                        if (vehicle.driver && speed > 80) {
                            await prisma.driverBehaviorEvent.create({
                                data: {
                                    driverId: vehicle.driver.id, vehicleId: vehicle.id,
                                    type: 'SPEEDING', value: speed, timestamp: new Date(Number(timestamp))
                                }
                            });
                            const newRating = Math.max(1.0, vehicle.driver.rating - 0.1);
                            await prisma.driver.update({ where: { id: vehicle.driver.id }, data: { rating: newRating } });
                        }

                        // Check Movon Events (Using IDs from plan)
                        // COM1 IDs: 11700 (Drowsiness), 11701 (Distraction), 11702 (Yawning), 11703 (Phone), 11704 (Smoking), 11705 (Absence)
                        // COM2 IDs: 12923 (Drowsiness)... (+1223 offset usually? or completely different. Using plan values)
                        // Plan says: COM1 11700..11712. COM2 12923..

                        const movonMap = {
                            11700: 'DROWSINESS', 12923: 'DROWSINESS',
                            11701: 'DISTRACTION', 12924: 'DISTRACTION',
                            11702: 'YAWNING', 12925: 'YAWNING',
                            11703: 'PHONE_USAGE', 12926: 'PHONE_USAGE',
                            11704: 'SMOKING', 12927: 'SMOKING',
                            11705: 'DRIVER_ABSENCE', 12928: 'DRIVER_ABSENCE'
                        };

                        for (const [id, value] of Object.entries(ioData)) {
                            const eventType = movonMap[id as unknown as keyof typeof movonMap];
                            // console.log(`[DEBUG] Checking IO ID: ${id}, Value: ${value}, Driver: ${vehicle.driver?.name}`);
                            if (eventType && value === 1 && vehicle.driver) {
                                console.log(`Movon Event detected: ${eventType} for ${vehicle.driver.name} (IO ID: ${id})`);
                                await prisma.driverBehaviorEvent.create({
                                    data: {
                                        driverId: vehicle.driver.id, vehicleId: vehicle.id,
                                        type: eventType, value: 1, timestamp: new Date(Number(timestamp))
                                    }
                                });
                                // Heavy penalty for fatigue
                                const penalty = eventType === 'DROWSINESS' ? 0.5 : 0.2;
                                const newRating = Math.max(1.0, vehicle.driver.rating - penalty);
                                await prisma.driver.update({ where: { id: vehicle.driver.id }, data: { rating: newRating } });
                            }
                        }

                    } catch (e) {
                        console.error(`Error processing record for ${imei}:`, e);
                    }
                }

                // Acknowledge Codec 8/8E
                const response = Buffer.alloc(4);
                response.writeUInt32BE(recordCount, 0);
                socket.write(response);

            } else if (codecId === 12 || codecId === 13) {
                // Codec 12/13: GPRS commands and RS232/RS485 data
                const recordCount = data.readUInt8(9);
                const type = data.readUInt8(10);
                const commandLen = data.readUInt32BE(11);
                const payload = data.slice(15, 15 + commandLen);

                console.log(`[CODEC ${codecId}] Type: 0x${type.toString(16)}, Len: ${commandLen}`);

                // If it's RS232 data (Type 0x05) and looks like image data or Movon protocol
                if (type === 0x05 || type === 0x06) {
                    const payloadHex = payload.toString('hex');
                    console.log(`[RS232] Payload (first 50 bytes): ${payloadHex.substring(0, 100)}`);

                    // Simple check for JPEG start (FF D8) or Movon image headers
                    // Note: Real implementation might need to buffer multiple chunks
                    if (payloadHex.startsWith('ffd8') || payloadHex.includes('ffd8')) {
                        const timestamp = Date.now();
                        const filename = `snapshot_${imei}_${timestamp}.jpg`;
                        const filepath = path.join(SNAPSHOT_DIR, filename);

                        // Extract JPEG from payload if there's a header
                        const startIdx = payload.indexOf(Buffer.from([0xff, 0xd8]));
                        if (startIdx !== -1) {
                            const imageData = payload.slice(startIdx);
                            fs.writeFileSync(filepath, imageData);
                            console.log(`[SNAPSHOT] Saved to ${filename}`);

                            // Link to most recent Fatigue Event for this vehicle
                            try {
                                const vehicle = await prisma.vehicle.findUnique({ where: { imei } });
                                if (vehicle) {
                                    const recentEvent = await prisma.driverBehaviorEvent.findFirst({
                                        where: {
                                            vehicleId: vehicle.id,
                                            type: { in: ['DROWSINESS', 'DISTRACTION', 'YAWNING', 'PHONE_USAGE', 'SMOKING', 'DRIVER_ABSENCE'] },
                                            timestamp: { gte: new Date(Date.now() - 30000) } // within last 30 seconds
                                        },
                                        orderBy: { timestamp: 'desc' }
                                    });

                                    if (recentEvent) {
                                        await prisma.driverBehaviorEvent.update({
                                            where: { id: recentEvent.id },
                                            data: { evidenceUrl: `/snapshots/${filename}` }
                                        });
                                        console.log(`[SNAPSHOT] Linked to event: ${recentEvent.type}`);
                                    }
                                }
                            } catch (err) {
                                console.error(`[SNAPSHOT] Error linking:`, err);
                            }
                        }
                    }
                }

                // Acknowledge Codec 12/13 (send back record count)
                const response = Buffer.alloc(4);
                response.writeUInt32BE(recordCount, 0);
                socket.write(response);
            }
        }
    });

    socket.on('end', () => console.log('Client disconnected'));
    socket.on('error', (err) => console.error('Socket error:', err));
});

server.listen(PORT, () => {
    console.log(`Teltonika TCP Server listening on port ${PORT}`);
});
