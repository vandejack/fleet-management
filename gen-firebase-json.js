const fs = require('fs');
const path = require('path');

try {
    const rawKey = fs.readFileSync('raw-key.txt', 'utf8');
    // Replace literal '\n' if present, and remove \r
    const cleanKey = rawKey.replace(/\\n/g, '\n').replace(/\r/g, '').trim();

    const data = {
        "type": "service_account",
        "project_id": "fleet-management-7c999",
        "private_key_id": "7c80827619677422153dd1e26947250b3b170ed3",
        "private_key": cleanKey,
        "client_email": "firebase-adminsdk-fbsvc@fleet-management-7c999.iam.gserviceaccount.com",
        "client_id": "100419488005068334434",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40fleet-management-7c999.iam.gserviceaccount.com",
        "universe_domain": "googleapis.com"
    };

    fs.writeFileSync('firebase-service-account.json', JSON.stringify(data, null, 2));
    console.log('firebase-service-account.json generated successfully with cleaned key');
} catch (e) {
    console.error('Error generating JSON:', e.message);
}
