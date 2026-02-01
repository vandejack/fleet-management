
import net from 'net';

const HOST = 'localhost';
const PORT = 7001;
const IMEI = '863719065062185'; // Using the existing IMEI from previous tests

const client = new net.Socket();

client.connect(PORT, HOST, () => {
    console.log(`Connected to ${HOST}:${PORT}`);

    // 1. Send IMEI
    const imeiBuffer = Buffer.alloc(2 + IMEI.length);
    imeiBuffer.writeUInt16BE(IMEI.length, 0);
    imeiBuffer.write(IMEI, 2);
    client.write(imeiBuffer);
    console.log(`Sent IMEI: ${IMEI}`);
});

client.on('data', (data) => {
    // Server confirms IMEI with 0x01
    if (data.length === 1 && data[0] === 1) {
        console.log('Server accepted IMEI. Sending speeding data...');
        sendSpeedingData();
    }
    // Server confirms Data with record count
    else if (data.length === 4) {
        console.log(`Server acknowledged ${data.readUInt32BE(0)} records.`);
        client.destroy(); // Close after success
    }
});

client.on('close', () => {
    console.log('Connection closed');
    process.exit(0);
});

function sendSpeedingData() {
    const timestamp = Date.now();

    // Construct AVL Data Packet (Codec 8)
    // Structure derived from Teltonika FM protocols

    // GPS Data
    const lat = -33166940; // -3.316694 * 10^7
    const lng = 1145901110; // 114.590111 * 10^7
    const altitude = 100;
    const angle = 90;
    const satellites = 10;
    const speed = 120; // 120 km/h (Speeding > 80)

    const avlData = Buffer.alloc(1024);
    let offset = 0;

    // Timestamp (8)
    avlData.writeBigUInt64BE(BigInt(timestamp), offset); offset += 8;
    // Priority (1)
    avlData.writeUInt8(1, offset); offset += 1;
    // GPS (15)
    avlData.writeInt32BE(lng, offset); offset += 4;
    avlData.writeInt32BE(lat, offset); offset += 4;
    avlData.writeInt16BE(altitude, offset); offset += 2;
    avlData.writeUInt16BE(angle, offset); offset += 2;
    avlData.writeUInt8(satellites, offset); offset += 1;
    avlData.writeUInt16BE(speed, offset); offset += 2;

    // IO Elements (Empty for simplicity)
    avlData.writeUInt8(0, offset); offset += 1; // Event IO ID
    avlData.writeUInt8(0, offset); offset += 1; // Total IO Count
    avlData.writeUInt8(0, offset); offset += 1; // 1B Count
    avlData.writeUInt8(0, offset); offset += 1; // 2B Count
    avlData.writeUInt8(0, offset); offset += 1; // 4B Count
    avlData.writeUInt8(0, offset); offset += 1; // 8B Count

    const dataLength = offset;

    // Full TCP Packet
    // [00 00 00 00] [Data Length 4B] [Codec ID 1B] [Count 1B] [Data] [Count 1B] [CRC 4B]
    const packet = Buffer.alloc(4 + 4 + 1 + 1 + dataLength + 1 + 4);
    let pOffset = 0;

    packet.writeUInt32BE(0, pOffset); pOffset += 4;
    packet.writeUInt32BE(dataLength + 3, pOffset); pOffset += 4; // DataLength + Codec + Count + Count
    packet.writeUInt8(0x08, pOffset); pOffset += 1; // Codec 8
    packet.writeUInt8(1, pOffset); pOffset += 1; // Record Count 1

    avlData.copy(packet, pOffset, 0, dataLength);
    pOffset += dataLength;

    packet.writeUInt8(1, pOffset); pOffset += 1; // Record Count 1
    packet.writeUInt32BE(0, pOffset); // CRC (fake 0 for now as server likely doesn't check it or logic is simple) 

    client.write(packet);
    console.log(`Sent packet with SPEED=${speed} km/h`);
}
