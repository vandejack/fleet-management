const net = require('net');

const HOST = 'localhost';
const PORT = 7001;
const IMEI = '123456789012345'; // Assigned to Truck A1
const SPEED_KMH = 120;

const client = new net.Socket();

client.connect(PORT, HOST, () => {
    console.log(`Connected to Teltonika server at ${HOST}:${PORT}`);

    // 1. Handshake: Send IMEI (2 bytes length + IMEI bytes)
    const imeiBuffer = Buffer.alloc(2 + IMEI.length);
    imeiBuffer.writeUInt16BE(IMEI.length, 0);
    imeiBuffer.write(IMEI, 2);

    client.write(imeiBuffer, () => {
        console.log(`Sent IMEI: ${IMEI}`);
    });
});

client.on('data', (data) => {
    if (data.length === 1 && data[0] === 0x01) {
        console.log('Handshake accepted. Sending AVL data...');
        sendAvlData();
    } else {
        console.log('Received response:', data.toString('hex'));
        const count = data.readUInt32BE(0);
        console.log(`Server acknowledged ${count} records.`);
        client.destroy();
    }
});

client.on('close', () => {
    console.log('Connection closed');
});

client.on('error', (err) => {
    console.error('Connection error:', err.message);
});

function sendAvlData() {
    // Construct Codec 8 Packet
    const timestamp = Date.now();
    const speed = SPEED_KMH;

    // Minimal AVL Record
    // Timestamp (8), Priority (1), Lon (4), Lat (4), Alt (2), Angle (2), Sats (1), Speed (2)
    // IO Event (1), IO Count (1), ... IO data ...

    const recordBuffer = Buffer.alloc(30); // Approximate
    let offset = 0;

    // Timestamp
    recordBuffer.writeBigUInt64BE(BigInt(timestamp), offset); offset += 8;
    // Priority
    recordBuffer.writeUInt8(1, offset); offset += 1;
    // Lon (Int32)
    recordBuffer.writeInt32BE(20000000, offset); offset += 4;
    // Lat (Int32)
    recordBuffer.writeInt32BE(50000000, offset); offset += 4;
    // Alt
    recordBuffer.writeUInt16BE(100, offset); offset += 2;
    // Angle
    recordBuffer.writeUInt16BE(0, offset); offset += 2;
    // Sats
    recordBuffer.writeUInt8(10, offset); offset += 1;
    // Speed
    recordBuffer.writeUInt16BE(speed, offset); offset += 2;
    // IO Event ID
    recordBuffer.writeUInt8(0, offset); offset += 1;
    // IO Count
    recordBuffer.writeUInt8(0, offset); offset += 1;

    // Packet Wrapper
    // Preamble (4), Data Size (4), Codec (1), Count (1), Data, Count (1), CRC (4)
    const dataSize = 1 + 1 + recordBuffer.length + 1; // Codec + Count + Data + Count
    const packet = Buffer.alloc(4 + 4 + dataSize + 4);

    offset = 0;
    packet.writeUInt32BE(0, offset); offset += 4; // Preamble
    packet.writeUInt32BE(dataSize, offset); offset += 4; // Data Size
    packet.writeUInt8(0x08, offset); offset += 1; // Codec ID
    packet.writeUInt8(1, offset); offset += 1; // Record Count 1

    recordBuffer.copy(packet, offset); offset += recordBuffer.length;

    packet.writeUInt8(1, offset); offset += 1; // Record Count 2

    // CRC (Simple calculation usually implies 0 or proper alg, for local test we might skip accurate CRC if server is lenient, 
    // but typical teltonika server checks it. Let's assume standard CRC16 logic or 0 if ignored)
    // Server code uses: const crc = buffer.readUInt32BE(buffer.length - 4);
    // And verify: const calculatedCrc = crc16(buffer.slice(8, buffer.length - 4));

    // We need CRC16-IBM usually.
    // Let's implement simple CRC 
    const crcData = packet.slice(8, packet.length - 4);
    const crc = crc16(crcData);
    packet.writeUInt32BE(crc, offset);

    client.write(packet, () => {
        console.log(`Sent packet with speed ${speed} km/h`);
    });
}

function crc16(buffer) {
    let crc = 0;
    for (let i = 0; i < buffer.length; i++) {
        crc ^= buffer[i];
        for (let j = 0; j < 8; j++) {
            if ((crc & 1) > 0) {
                crc = (crc >> 1) ^ 0xA001;
            } else {
                crc = crc >> 1;
            }
        }
    }
    return crc;
}
