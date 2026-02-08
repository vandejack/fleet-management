
function parseCodec8E(hex: string) {
    const data = Buffer.from(hex, 'hex');
    let offset = 0;

    // Preamble & Length
    offset += 8;
    const codecId = data.readUInt8(offset); offset += 1;
    const recordCount = data.readUInt8(offset); offset += 1;

    console.log(`Codec: ${codecId.toString(16)}, Records: ${recordCount}`);

    for (let i = 0; i < recordCount; i++) {
        const timestamp = data.readBigUInt64BE(offset); offset += 8;
        const priority = data.readUInt8(offset); offset += 1;
        offset += 4; // lng
        offset += 4; // lat
        offset += 2; // alt
        offset += 2; // angle
        offset += 1; // sats
        offset += 2; // speed

        const eventId = data.readUInt16BE(offset); offset += 2;
        const totalIo = data.readUInt16BE(offset); offset += 2;

        console.log(`Record ${i}: Event ID ${eventId}, Total IO ${totalIo}`);

        const readIOs = (bytes: number) => {
            const count = data.readUInt16BE(offset); offset += 2;
            console.log(`  ${bytes}-byte IOs: ${count}`);
            for (let j = 0; j < count; j++) {
                const id = data.readUInt16BE(offset); offset += 2;
                const val = data.readUIntBE(offset, bytes); offset += bytes;
                console.log(`    ID: ${id}, Val: ${val}`);
            }
        };

        readIOs(1); readIOs(2); readIOs(4); readIOs(8);

        // NX
        if (offset < data.length - 1) { // -1 for Record Count footer
            const nxCount = data.readUInt16BE(offset); offset += 2;
            console.log(`  NX Elements: ${nxCount}`);
            for (let j = 0; j < nxCount; j++) {
                const id = data.readUInt16BE(offset); offset += 2;
                const len = data.readUInt16BE(offset); offset += 2;
                const valString = data.toString('utf8', offset, offset + len).replace(/[^\x20-\x7E]/g, '');
                console.log(`    NX ID: ${id}, Len: ${len}, Text: ${valString}`);
                offset += len;
            }
        }
    }
}

const hex = "000000000000016b8e010000019c233079ae0044743885fdf0d787000000000000000002ffff790d00110100008d6900010000000000c55f5b7941580000000000416273656e636500000";
// Wait, my hex string above is truncated. I'll use the one from the logs if possible.
// But I'll try to parse what I have.
parseCodec8E(hex);
