const fs = require('fs');
const crypto = require('crypto');

try {
    const content = fs.readFileSync('firebase-service-account.json', 'utf8');
    const account = JSON.parse(content);
    const key = account.private_key;

    console.log('--- Key Inspection ---');
    console.log('Length:', key.length);
    console.log('First 50 chars:', JSON.stringify(key.substring(0, 50)));
    console.log('Contains \\n literal:', key.includes('\\n'));
    console.log('Contains actual newline:', key.includes('\n'));
    console.log('----------------------');

    const sign = crypto.createSign('RSA-SHA256');
    sign.update('test');
    sign.sign(key, 'hex');
    console.log('SUCCESS: Key is valid for signing (crypto).');

    // Test Admin Init
    const admin = require('firebase-admin');
    try {
        admin.initializeApp({
            credential: admin.credential.cert('firebase-service-account.json')
        });
        console.log('SUCCESS: Firebase Admin initialized.');
    } catch (e) {
        console.error('ERROR (Admin Init):', e.message);
    }

} catch (e) {
    console.error('ERROR (Crypto):', e.message);
}
