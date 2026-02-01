"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
// Native fetch is available in Node 18+
var TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
var TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
var NGROK_API = 'http://127.0.0.1:4040/api/tunnels';
function getNgrokTunnels() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch(NGROK_API)];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Ngrok API error: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, data.tunnels];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error fetching ngrok tunnels:', error_1);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function sendTelegramMessage(message) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
                        console.warn('Telegram credentials missing. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env');
                        return [2 /*return*/];
                    }
                    url = "https://api.telegram.org/bot".concat(TELEGRAM_BOT_TOKEN, "/sendMessage");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                chat_id: TELEGRAM_CHAT_ID,
                                text: message,
                                parse_mode: 'Markdown'
                            })
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (!data.ok) {
                        console.error('Telegram API error:', data);
                    }
                    else {
                        console.log("Telegram notification sent to ".concat(TELEGRAM_CHAT_ID));
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error('Failed to send Telegram message:', error_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function checkAndNotify() {
    return __awaiter(this, void 0, void 0, function () {
        var tunnels, message_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Checking Ngrok status...');
                    return [4 /*yield*/, getNgrokTunnels()];
                case 1:
                    tunnels = _a.sent();
                    if (!(tunnels && tunnels.length > 0)) return [3 /*break*/, 3];
                    message_1 = '*Ngrok Session Active*\n\n';
                    tunnels.forEach(function (t) {
                        message_1 += "\u2022 *".concat(t.name, "*: ").concat(t.public_url, " -> ").concat(t.config.addr, "\n");
                    });
                    message_1 += "\n_Checked at: ".concat(new Date().toLocaleTimeString(), "_");
                    return [4 /*yield*/, sendTelegramMessage(message_1)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    console.log('No active ngrok tunnels found.');
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Initial Run
checkAndNotify();
// Poll every 1 hour (3600000 ms)
console.log('Starting hourly Ngrok monitor...');
setInterval(checkAndNotify, 3600000);
