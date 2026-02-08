
const net = require('net');
const fs = require('fs');

const PORT = 7001;

const server = net.createServer((socket) => {
    console.log('Client connected');
    let imei = '';
    let buffer = Buffer.alloc(0);

    socket.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);
        console.log('--- RECEIVED CHUNK ---', chunk.length, 'bytes');

        if (!imei) {
            if (buffer.length >= 2) {
                const len = buffer.readUInt16BE(0);
                if (buffer.length >= 2 + len) {
                    imei = buffer.slice(2, 2 + len).toString('ascii');
                    buffer = buffer.slice(2 + len);
                    console.log('HANDSHAKE IMEI:', imei);
                    socket.write(Buffer.from([0x01]));
                }
            }
            return;
        }

        while (buffer.length >= 12) {
            if (buffer.readUInt32BE(0) !== 0) {
                buffer = buffer.slice(1);
                continue;
            }
            const dataLen = buffer.readUInt32BE(4);
            const total = dataLen + 12;
            if (buffer.length < total) break;

            const data = buffer.slice(0, total);
            buffer = buffer.slice(total);

            const codec = data.readUInt8(8);
            const records = data.readUInt8(9);
            console.log(`[PACKET] Codec: 0x${codec.toString(16).toUpperCase()}, Records: ${records}, Len: ${dataLen}`);

            if (codec === 0x08 || codec === 0x8E) {
                let offset = 10;
                for (let i = 0; i < records; i++) {
                    const ts = data.readBigUInt64BE(offset); offset += 8;
                    const date = new Date(Number(ts));
                    console.log(`  - Record ${i} Time: ${date.toISOString()}`);
                    // Skip rest of record (simplified)
                    offset += 15; // basic priority + coords + sensors
                    if (codec === 0x08) {
                        offset += 1; // event id
                        const c1 = data.readUInt8(offset); offset += 1;
                        for (let j = 0; j < c1; j++) offset += 1 + 1;
                        const c2 = data.readUInt8(offset); offset += 1;
                        for (let j = 0; j < c2; j++) offset += 1 + 2;
                        const c4 = data.readUInt8(offset); offset += 1;
                        for (let j = 0; j < c4; j++) offset += 1 + 4;
                        const c8 = data.readUInt8(offset); offset += 1;
                        for (let j = 0; j < c8; j++) offset += 1 + 8;
                    } else {
                        offset += 2; // event id
                        const c1 = data.readUInt16BE(offset); offset += 2;
                        for (let j = 0; j < c1; j++) offset += 2 + 1;
                        const c2 = data.readUInt16BE(offset); offset += 2;
                        for (let j = 0; j < c2; j++) offset += 2 + 2;
                        const c4 = data.readUInt16BE(offset); offset += 2;
                        for (let j = 0; j < c4; j++) offset += 2 + 4;
                        const c8 = data.readUInt16BE(offset); offset += 2;
                        for (let j = 0; j < c8; j++) offset += 2 + 8;
                        const nx = data.readUInt16BE(offset); offset += 2;
                        for (let j = 0; j < nx; j++) {
                            offset += 2;
                            const l = data.readUInt16BE(offset); offset += 2 + l;
                        }
                    }
                }
            }

            if (socket.writable) {
                const ack = Buffer.alloc(4);
                ack.writeUInt32BE(records, 0);
                socket.write(ack);
            }
        }
    });

    socket.on('error', (e) => console.log('Socket Error:', e.message));
    socket.on('end', () => console.log('Client closed'));
});

server.on('error', (e) => console.error('Server error:', e.message));

server.listen(PORT, () => console.log('Teltonika Mini-Server listening on 7001'));
