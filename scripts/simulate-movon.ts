import net from 'net';

const HOST = 'localhost';
const PORT = 7001;
const IMEI = '863719065062185';

const client = new net.Socket();

client.connect(PORT, HOST, () => {
    console.log(`Connected to ${HOST}:${PORT}`);
    const imeiBuffer = Buffer.alloc(2 + IMEI.length);
    imeiBuffer.writeUInt16BE(IMEI.length, 0);
    imeiBuffer.write(IMEI, 2);
    client.write(imeiBuffer);
});

client.on('data', (data) => {
    if (data.length === 1 && data[0] === 1) {
        console.log('Sending Codec 8E Movon Data...');
        sendMovonData();
    } else if (data.length === 4) {
        console.log(`Acknowledged ${data.readUInt32BE(0)} records.`);
        client.destroy();
    }
});

function sendMovonData() {
    const timestamp = Date.now();
    const lat = -33166940;
    const lng = 1145901110;
    const speed = 0;

    // Construct Codec 8E AVL Data
    const avlData = Buffer.alloc(1024);
    let offset = 0;

    avlData.writeBigUInt64BE(BigInt(timestamp), offset); offset += 8;
    avlData.writeUInt8(1, offset); offset += 1;
    avlData.writeInt32BE(lng, offset); offset += 4;
    avlData.writeInt32BE(lat, offset); offset += 4;
    avlData.writeInt16BE(100, offset); offset += 2;
    avlData.writeUInt16BE(0, offset); offset += 2;
    avlData.writeUInt8(10, offset); offset += 1;
    avlData.writeUInt16BE(speed, offset); offset += 2;

    // Codec 8E IOs (2-byte IDs)
    // 11700 (Drowsiness) = 1
    const eventIoId = 11700;
    avlData.writeUInt16BE(eventIoId, offset); offset += 2; // Event ID
    avlData.writeUInt16BE(1, offset); offset += 2; // Total IO Count

    // 1 Byte IOs
    avlData.writeUInt16BE(1, offset); offset += 2; // Count
    avlData.writeUInt16BE(11700, offset); offset += 2; // ID: Drowsiness
    avlData.writeUInt8(1, offset); offset += 1;    // Value: 1 (Detected)

    // 2 Byte IOs
    avlData.writeUInt16BE(0, offset); offset += 2;
    // 4 Byte IOs
    avlData.writeUInt16BE(0, offset); offset += 2;
    // 8 Byte IOs
    avlData.writeUInt16BE(0, offset); offset += 2;

    const dataLength = offset;

    const packet = Buffer.alloc(4 + 4 + 1 + 1 + dataLength + 1 + 4);
    let pOffset = 0;
    packet.writeUInt32BE(0, pOffset); pOffset += 4;
    packet.writeUInt32BE(dataLength + 3, pOffset); pOffset += 4;
    packet.writeUInt8(0x8E, pOffset); pOffset += 1; // Codec 8 Extended
    packet.writeUInt8(1, pOffset); pOffset += 1;    // Record Count

    avlData.copy(packet, pOffset, 0, dataLength);
    pOffset += dataLength;

    packet.writeUInt8(1, pOffset); pOffset += 1;
    packet.writeUInt32BE(0, pOffset);

    client.write(packet);
}
