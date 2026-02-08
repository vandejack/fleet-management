
const dgram = require('dgram');
const server = dgram.createSocket('udp4');

const PORT = 7001;

server.on('message', (msg, rinfo) => {
    console.log(`UDP received from ${rinfo.address}:${rinfo.port}: ${msg.toString('hex')}`);
});

server.on('listening', () => {
    const address = server.address();
    console.log(`UDP Server listening on ${address.address}:${address.port}`);
});

server.bind(PORT);
