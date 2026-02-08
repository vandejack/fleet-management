const net = require('net');

const HOST = '1.tcp.ap.ngrok.io';
const PORT = 23907;

const client = new net.Socket();

const imei = '999999999999999';
const length = imei.length;

// Create buffer: 2 bytes length + IMEI
const buffer = Buffer.alloc(2 + length);
buffer.writeUInt16BE(length, 0);
buffer.write(imei, 2);

console.log(`Sending Handshake Packet to ${HOST}:${PORT}...`);
console.log('Hex:', buffer.toString('hex'));

client.connect(PORT, HOST, function () {
    console.log('Connected!');
    client.write(buffer);
});

client.on('data', function (data) {
    console.log('Received response:', data.toString('hex'));
    if (data.length === 1 && data[0] === 1) {
        console.log('✅ Server accepted handshake (0x01)');
    } else {
        console.log('❌ Unexpected response');
    }
    client.end();
});

client.on('close', function () {
    console.log('Connection closed');
});

client.on('error', function (err) {
    console.error('Connection error:', err.message);
});
