const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5050;
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Developer's Default Telegram Bot Token & Multi-Parent Chat Map
const DEFAULT_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
let lastCapturedChatId = process.env.TELEGRAM_CHAT_ID || "";
const parentChatMap = {}; // phone_number -> chat_id
let updateOffset = 0;

function cleanPhoneNumber(phone) {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("998")) cleaned = "+" + cleaned;
    else if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
    return cleaned;
}

function sendTelegramMessage(botToken, chatId, messageText, callback, replyMarkup = null) {
    const token = botToken || DEFAULT_BOT_TOKEN;
    const targetChatId = chatId || lastCapturedChatId;
    if (!token || !targetChatId) {
        if (callback) callback({ success: false, error: "Bot token yoki Chat ID hali ulanganicha yo'q!" });
        return;
    }
    const payloadObj = {
        chat_id: targetChatId,
        text: messageText,
        parse_mode: 'HTML'
    };
    if (replyMarkup) {
        payloadObj.reply_markup = replyMarkup;
    }

    const postData = JSON.stringify(payloadObj);

    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${token}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                if (callback) callback({ success: parsed.ok, response: parsed });
            } catch (e) {
                if (callback) callback({ success: false, error: e.message });
            }
        });
    });

    req.on('error', (e) => {
        console.error('Telegram API error:', e);
        if (callback) callback({ success: false, error: e.message });
    });
    req.write(postData);
    req.end();
}

// Automatic Telegram Polling & Parent Phone Verification Engine
function startTelegramPolling() {
    const token = DEFAULT_BOT_TOKEN;
    if (!token) return;

    setInterval(() => {
        const pathUrl = `/bot${token}/getUpdates?offset=${updateOffset}&timeout=3`;
        https.get(`https://api.telegram.org${pathUrl}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.ok && parsed.result && parsed.result.length > 0) {
                        parsed.result.forEach(upd => {
                            updateOffset = upd.update_id + 1;
                            if (upd.message && upd.message.chat) {
                                const chatId = upd.message.chat.id;
                                lastCapturedChatId = chatId;

                                // 1. User sends /start
                                if (upd.message.text && upd.message.text.includes("/start")) {
                                    const welcomeMsg = `🤖 <b>SafeBus Smart Transport Botiga Xush Kelibsiz!</b>\n\nFarzandingiz avtobusga chiqishi va tushishini real-vaqtda kuzatish uchun pastdagi <b>[📱 Telefon Raqamimni Yuborish]</b> tugmasini bosing:`;
                                    
                                    const keyboardMarkup = {
                                        keyboard: [
                                            [{ text: "📱 Telegram Telefon Raqamimni Yuborish", request_contact: true }]
                                        ],
                                        resize_keyboard: true,
                                        one_time_keyboard: true
                                    };

                                    sendTelegramMessage(token, chatId, welcomeMsg, null, keyboardMarkup);
                                }

                                // 2. User sends Contact (Phone Number Verification)
                                else if (upd.message.contact) {
                                    const rawPhone = upd.message.contact.phone_number;
                                    const normPhone = cleanPhoneNumber(rawPhone);
                                    
                                    parentChatMap[normPhone] = chatId;
                                    parentChatMap[rawPhone] = chatId;

                                    console.log(`✅ PARENT VERIFIED: Phone ${normPhone} bound to Chat ID ${chatId}`);

                                    const confirmMsg = `✅ <b>Muvaffaqiyatli Ulindi!</b>\n\nSizning telefon raqamingiz (<b>${normPhone}</b>) SafeBus tizimiga biriktirildi!\n\nEndi farzandingiz avtobusda barmog'ini skanerga tekkizganida xabarnoma ZUDLIK BILAN FAQAT SIZGA keladi.`;
                                    
                                    const removeKeyboard = { remove_keyboard: true };
                                    sendTelegramMessage(token, chatId, confirmMsg, null, removeKeyboard);
                                }
                            }
                        });
                    }
                } catch (e) {}
            });
        }).on('error', () => {});
    }, 2500);
}

http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];

    // Handle Telegram API Proxy Route
    if (req.method === 'POST' && reqUrl === '/api/send-telegram') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const { parentPhone, text } = payload;
                const normParentPhone = cleanPhoneNumber(parentPhone);

                // Find matching chat ID for this parent phone (STRICT MATCHING)
                let targetChatId = parentChatMap[normParentPhone] || parentChatMap[parentPhone];

                if (targetChatId) {
                    sendTelegramMessage(DEFAULT_BOT_TOKEN, targetChatId, text, (result) => {
                        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                        res.end(JSON.stringify(result));
                    });
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    res.end(JSON.stringify({ success: false, error: "Ushbu ota-onaning telefon raqamiga ulangan Telegram chat topilmadi!" }));
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: "Noto'g'ri format" }));
            }
        });
        return;
    }

    // Handle Telegram API Send OTP Route
    if (req.method === 'POST' && reqUrl === '/api/send-otp') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const { parentPhone } = payload;
                const normParentPhone = cleanPhoneNumber(parentPhone);
                const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

                let targetChatId = parentChatMap[normParentPhone] || parentChatMap[parentPhone] || lastCapturedChatId;

                const otpMsg = `🔑 <b>SafeBus Tizimiga Kirish Kodi: ${otpCode}</b>\n\nUshbu 4-xonali tasdiqlash kodini SafeBus mobil ilovasiga kiriting.\n⚠️ <i>Kodni hech kimga bermang!</i>`;

                if (targetChatId) {
                    sendTelegramMessage(DEFAULT_BOT_TOKEN, targetChatId, otpMsg, (result) => {
                        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                        res.end(JSON.stringify({ success: true, otpCode: otpCode, sentViaTelegram: true }));
                    });
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    res.end(JSON.stringify({ success: true, otpCode: otpCode, sentViaTelegram: false, notice: "Telegram botga hali bog'lanmagan, demo kod ishlatildi." }));
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: "Noto'g'ri format" }));
            }
        });
        return;
    }

    // Handle JWT Authentication & Refresh Token Endpoint
    if (req.method === 'POST' && reqUrl === '/api/auth/token') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const { role, userIdentifier } = payload;
                const now = Date.now();
                const accessToken = "sb_access_" + Buffer.from(`${role}:${userIdentifier}:${now}:${now + 900000}`).toString('base64');
                const refreshToken = "sb_refresh_" + Buffer.from(`${role}:${userIdentifier}:${now}:${now + 2592000000}`).toString('base64');
                
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({
                    success: true,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    expiresIn: 900,
                    user: { role, userIdentifier }
                }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: "JWT Auth format error" }));
            }
        });
        return;
    }

    let filePath = path.join(__dirname, reqUrl === '/' ? 'index.html' : reqUrl);
    let extname = String(path.extname(filePath)).toLowerCase();
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 Topilmadi</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Server Xatosi: ' + error.code, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' });
            res.end(content, 'utf-8');
        }
    });
}).listen(PORT, '0.0.0.0', () => {
    console.log(`SafeBus Node Server + Telegram API Proxy running at http://0.0.0.0:${PORT}/`);
    startTelegramPolling();
});
