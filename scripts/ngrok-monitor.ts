
import 'dotenv/config';
// Native fetch is available in Node 18+

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const NGROK_API = 'http://127.0.0.1:4040/api/tunnels';

async function getNgrokTunnels() {
    try {
        const response = await fetch(NGROK_API);
        if (!response.ok) {
            throw new Error(`Ngrok API error: ${response.statusText}`);
        }
        const data: any = await response.json();
        return data.tunnels;
    } catch (error) {
        console.error('Error fetching ngrok tunnels:', error);
        return [];
    }
}

async function sendTelegramMessage(message: string) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.warn('Telegram credentials missing. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env');
        return;
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        const data: any = await response.json();
        if (!data.ok) {
            console.error('Telegram API error:', data);
        } else {
            console.log(`Telegram notification sent to ${TELEGRAM_CHAT_ID}`);
        }
    } catch (error) {
        console.error('Failed to send Telegram message:', error);
    }
}

async function checkAndNotify() {
    console.log('Checking Ngrok status...');
    const tunnels = await getNgrokTunnels();

    if (tunnels && tunnels.length > 0) {
        let message = '*Ngrok Session Active*\n\n';
        tunnels.forEach((t: any) => {
            message += `• *${t.name}*: ${t.public_url} -> ${t.config.addr}\n`;
        });
        message += `\n_Checked at: ${new Date().toLocaleTimeString()}_`;

        await sendTelegramMessage(message);
    } else {
        console.log('No active ngrok tunnels found.');
    }
}

// Initial Run
checkAndNotify();

// Poll every 1 hour (3600000 ms)
console.log('Starting hourly Ngrok monitor...');
setInterval(checkAndNotify, 3600000);
