

const net = require('net');

const PORT = process.env.PORT || 7001;

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
        if (data.length > 10 && data.readUInt32BE(0) === 0) {
            const dataLength = data.readUInt32BE(4);
            const codecId = data.readUInt8(8);
            const recordCount = data.readUInt8(9);

            console.log(`Received ${recordCount} records, Codec ID: 0x${codecId.toString(16).toUpperCase()}`);

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
                let ioData = {};

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
                    // Codec 8E might have variable length IOs (X bytes), skipping for now as Movon uses std
                }

                // Process Record
                try {
                    // Update Vehicle
                    const vehicle = await prisma.vehicle.update({
                        where: { imei },
                        data: {
                            lat, lng, speed,
                            lastLocationTime: new Date(Number(timestamp)),
                            status: speed > 0 ? 'moving' : 'stopped'
                        },
                        include: { driver: true }
                    });

                    // Save History
                    await prisma.locationHistory.create({
                        data: {
                            vehicleId: vehicle.id, lat, lng, speed, heading: angle,
                            timestamp: new Date(Number(timestamp))
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
                        const eventType = movonMap[id];
                        if (eventType && value === 1 && vehicle.driver) {
                            console.log(`Movon Event detected: ${eventType} for ${vehicle.driver.name}`);
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

            // Acknowledge
            const response = Buffer.alloc(4);
            response.writeUInt32BE(recordCount, 0);
            socket.write(response);
        }
    });

    socket.on('end', () => console.log('Client disconnected'));
    socket.on('error', (err) => console.error('Socket error:', err));
});

server.listen(PORT, () => {
    console.log(`Teltonika TCP Server listening on port ${PORT}`);
});
