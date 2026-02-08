const net = require('net');

const HOST = '1.tcp.ap.ngrok.io';
const PORT = 23907;

console.log(`Connecting to ${HOST}:${PORT}...`);

const client = new net.Socket();

client.connect(PORT, HOST, function() {
    console.log('✅ Connected successfully!');
    console.log('Sending test data...');
    // Send a 0-byte heartbeat or simple payload matching the Teltonika protocol roughly (optional)
    // Or just checking connection is enough to prove the TCP tunnel is up.
    client.write('TEST_CONNECTION'); 
});

client.on('data', function(data) {
    console.log('Received data: ' + data);
    client.destroy(); // kill client after server's response
});

client.on('close', function() {
    console.log('Connection closed');
});

client.on('error', function(err) {
    console.error('❌ Connection failed:', err.message);
});
