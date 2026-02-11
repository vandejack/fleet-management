const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

try {
    const account = JSON.parse(fs.readFileSync('firebase-service-account.json', 'utf8'));
    let key = account.private_key;
    if (key.includes('BEGIN PRIVATE KEY')) {
        key = key.replace('BEGIN PRIVATE KEY', 'BEGIN RSA PRIVATE KEY')
            .replace('END PRIVATE KEY', 'END RSA PRIVATE KEY');
    }
    console.log('Key length:', key.length);
    console.log('Key start:', key.substring(0, 50));

    const sign = crypto.createSign('RSA-SHA256');
    sign.update('test data');
    const signature = sign.sign(key, 'hex');
    console.log('Signature generated successfully');
} catch (e) {
    console.error('Crypto error:', e.message);
    console.error('Stack:', e.stack);
}
