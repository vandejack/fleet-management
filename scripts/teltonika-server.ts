
import net from 'net';
c
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
            // First packet is IMEI (2 bytes length + IMEI)
            const length = data.readUInt16BE(0);
            imei = data.toString('ascii', 2, 2 + length);
            console.log(`Device IMEI: ${imei}`);

            // Check if IMEI is in our DB? For now accept all.
            // Send 0x01 to accept
            const response = Buffer.alloc(1);
            response.writeUInt8(1, 0);
            socket.write(response);
            return;
        }

        // 2. AVL Data Parsing (Codec 8)
        // Structure: [00 00 00 00] [Data Length] [Codec ID] [Count] [Data...] [Count] [CRC]
        if (data.length > 10 && data.readUInt32BE(0) === 0) {
            const dataLength = data.readUInt32BE(4);
            const codecId = data.readUInt8(8);
            const recordCount = data.readUInt8(9);

            console.log(`Received ${recordCount} records, Codec ID: ${codecId}`);

            if (codecId === 0x08) {
                let offset = 10; // Start after record count

                for (let i = 0; i < recordCount; i++) {
                    // Timestamp (8 bytes)
                    // Timestamps are in milliseconds since epoch
                    const timestamp = data.readBigUInt64BE(offset);
                    offset += 8;

                    // Priority (1 byte)
                    const priority = data.readUInt8(offset);
                    offset += 1;

                    // GPS Element (15 bytes)
                    const lng = data.readInt32BE(offset) / 10000000;
                    offset += 4;
                    const lat = data.readInt32BE(offset) / 10000000;
                    offset += 4;
                    const altitude = data.readInt16BE(offset);
                    offset += 2;
                    const angle = data.readUInt16BE(offset);
                    offset += 2;
                    const satellites = data.readUInt8(offset);
                    offset += 1;
                    const speed = data.readUInt16BE(offset);
                    offset += 2;

                    // IO Element (Variable length)
                    const eventIoId = data.readUInt8(offset);
                    offset += 1;
                    const totalIoCount = data.readUInt8(offset);
                    offset += 1;

                    // Skip IO data (implementation depends on specific IO IDs needed)
                    // Use a proper parser library in production
                    // This is a simplified skip logic
                    let ioCount1B = data.readUInt8(offset); offset += 1;
                    offset += ioCount1B * 2; // 1 byte ID + 1 byte Value

                    let ioCount2B = data.readUInt8(offset); offset += 1;
                    offset += ioCount2B * 3; // 1 byte ID + 2 bytes Value

                    let ioCount4B = data.readUInt8(offset); offset += 1;
                    offset += ioCount4B * 5; // 1 byte ID + 4 bytes Value

                    let ioCount8B = data.readUInt8(offset); offset += 1;
                    offset += ioCount8B * 9; // 1 byte ID + 8 bytes Value

                    console.log(`Record ${i + 1}: Lat=${lat}, Lng=${lng}, Speed=${speed}, Time=${new Date(Number(timestamp)).toISOString()}`);

                    // Update Database
                    try {
                        await prisma.vehicle.update({
                            where: { imei: imei },
                            data: {
                                lat: lat,
                                lng: lng,
                                speed: speed,
                                lastLocationTime: new Date(Number(timestamp)),
                                status: speed > 0 ? 'moving' : 'stopped'
                            }
                        });
                        console.log(`Updated vehicle location for IMEI ${imei}`);
                    } catch (error) {
                        console.error(`Failed to update vehicle for IMEI ${imei}. Ensure vehicle exists in DB.`);
                    }
                }
            }
        }

        // 3. Acknowledge Data
        const response = Buffer.alloc(4);
        response.writeUInt32BE(recordCount, 0);
        socket.write(response);
    }

    socket.on('end', () => {
        console.log('Client disconnected');
    });

    socket.on('error', (err) => {
        console.error('Socket error:', err);
    });
});

server.listen(PORT, () => {
    console.log(`Teltonika TCP Server listening on port ${PORT}`);
});
