"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
var net = __importStar(require("net"));
var PORT = process.env.PORT || 7001;
// Helper to parse Teltonika IO Elements
function parseIoElements(buffer, offset) {
    // Teltonika IO parsing logic is complex, simplified here for structure
    // See Codec 8 doc for full spec
    return { offset: offset, elements: [] };
}
var PrismaClient = require('@prisma/client').PrismaClient;
var prisma = new PrismaClient();
var server = net.createServer(function (socket) {
    console.log('Client connected');
    var imei = '';
    socket.on('data', function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var length_1, response, dataLength, codecId, recordCount, offset_1, records, _loop_1, i, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Received data:', data.toString('hex'));
                    // 1. IMEI Handshake
                    if (!imei) {
                        length_1 = data.readUInt16BE(0);
                        imei = data.toString('ascii', 2, 2 + length_1);
                        console.log("Device IMEI: ".concat(imei));
                        response = Buffer.alloc(1);
                        response.writeUInt8(1, 0);
                        socket.write(response);
                        return [2 /*return*/];
                    }
                    if (!(data.length > 10 && data.readUInt32BE(0) === 0)) return [3 /*break*/, 5];
                    dataLength = data.readUInt32BE(4);
                    codecId = data.readUInt8(8);
                    recordCount = data.readUInt8(9);
                    console.log("Received ".concat(recordCount, " records, Codec ID: 0x").concat(codecId.toString(16).toUpperCase()));
                    offset_1 = 10;
                    records = [];
                    _loop_1 = function (i) {
                        var timestamp, priority, lng, lat, altitude, angle, satellites, speed, eventIoId, ioData, totalIoCount, readIOs, totalIoCount, readIOs, vehicle, newRating, movonMap, _i, _b, _c, id, value, eventType, penalty, newRating, e_1;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    timestamp = data.readBigUInt64BE(offset_1);
                                    offset_1 += 8;
                                    priority = data.readUInt8(offset_1);
                                    offset_1 += 1;
                                    lng = data.readInt32BE(offset_1) / 10000000;
                                    offset_1 += 4;
                                    lat = data.readInt32BE(offset_1) / 10000000;
                                    offset_1 += 4;
                                    altitude = data.readInt16BE(offset_1);
                                    offset_1 += 2;
                                    angle = data.readUInt16BE(offset_1);
                                    offset_1 += 2;
                                    satellites = data.readUInt8(offset_1);
                                    offset_1 += 1;
                                    speed = data.readUInt16BE(offset_1);
                                    offset_1 += 2;
                                    eventIoId = 0;
                                    ioData = {};
                                    if (codecId === 0x08) {
                                        // Codec 8 (1-byte IDs)
                                        eventIoId = data.readUInt8(offset_1);
                                        offset_1 += 1;
                                        totalIoCount = data.readUInt8(offset_1);
                                        offset_1 += 1;
                                        readIOs = function (bytes) {
                                            var count = data.readUInt8(offset_1);
                                            offset_1 += 1;
                                            for (var j = 0; j < count; j++) {
                                                var id = data.readUInt8(offset_1);
                                                offset_1 += 1;
                                                var val = data.readUIntBE(offset_1, bytes);
                                                offset_1 += bytes;
                                                ioData[id] = val;
                                            }
                                        };
                                        readIOs(1);
                                        readIOs(2);
                                        readIOs(4);
                                        readIOs(8);
                                    }
                                    else if (codecId === 0x8E) {
                                        // Codec 8 Extended (2-byte IDs)
                                        eventIoId = data.readUInt16BE(offset_1);
                                        offset_1 += 2;
                                        totalIoCount = data.readUInt16BE(offset_1);
                                        offset_1 += 2;
                                        readIOs = function (bytes) {
                                            var count = data.readUInt16BE(offset_1);
                                            offset_1 += 2;
                                            for (var j = 0; j < count; j++) {
                                                var id = data.readUInt16BE(offset_1);
                                                offset_1 += 2;
                                                var val = data.readUIntBE(offset_1, bytes);
                                                offset_1 += bytes;
                                                ioData[id] = val;
                                            }
                                        };
                                        readIOs(1);
                                        readIOs(2);
                                        readIOs(4);
                                        readIOs(8);
                                        // Codec 8E might have variable length IOs (X bytes), skipping for now as Movon uses std
                                    }
                                    _d.label = 1;
                                case 1:
                                    _d.trys.push([1, 12, , 13]);
                                    return [4 /*yield*/, prisma.vehicle.update({
                                            where: { imei: imei },
                                            data: {
                                                lat: lat,
                                                lng: lng,
                                                speed: speed,
                                                lastLocationTime: new Date(Number(timestamp)),
                                                status: speed > 0 ? 'moving' : 'stopped'
                                            },
                                            include: { driver: true }
                                        })];
                                case 2:
                                    vehicle = _d.sent();
                                    // Save History
                                    return [4 /*yield*/, prisma.locationHistory.create({
                                            data: {
                                                vehicleId: vehicle.id,
                                                lat: lat,
                                                lng: lng,
                                                speed: speed,
                                                heading: angle,
                                                timestamp: new Date(Number(timestamp))
                                            }
                                        })];
                                case 3:
                                    // Save History
                                    _d.sent();
                                    if (!(vehicle.driver && speed > 80)) return [3 /*break*/, 6];
                                    return [4 /*yield*/, prisma.driverBehaviorEvent.create({
                                            data: {
                                                driverId: vehicle.driver.id, vehicleId: vehicle.id,
                                                type: 'SPEEDING', value: speed, timestamp: new Date(Number(timestamp))
                                            }
                                        })];
                                case 4:
                                    _d.sent();
                                    newRating = Math.max(1.0, vehicle.driver.rating - 0.1);
                                    return [4 /*yield*/, prisma.driver.update({ where: { id: vehicle.driver.id }, data: { rating: newRating } })];
                                case 5:
                                    _d.sent();
                                    _d.label = 6;
                                case 6:
                                    movonMap = {
                                        11700: 'DROWSINESS', 12923: 'DROWSINESS',
                                        11701: 'DISTRACTION', 12924: 'DISTRACTION',
                                        11702: 'YAWNING', 12925: 'YAWNING',
                                        11703: 'PHONE_USAGE', 12926: 'PHONE_USAGE',
                                        11704: 'SMOKING', 12927: 'SMOKING',
                                        11705: 'DRIVER_ABSENCE', 12928: 'DRIVER_ABSENCE'
                                    };
                                    _i = 0, _b = Object.entries(ioData);
                                    _d.label = 7;
                                case 7:
                                    if (!(_i < _b.length)) return [3 /*break*/, 11];
                                    _c = _b[_i], id = _c[0], value = _c[1];
                                    eventType = movonMap[id];
                                    if (!(eventType && value === 1 && vehicle.driver)) return [3 /*break*/, 10];
                                    console.log("Movon Event detected: ".concat(eventType, " for ").concat(vehicle.driver.name));
                                    return [4 /*yield*/, prisma.driverBehaviorEvent.create({
                                            data: {
                                                driverId: vehicle.driver.id, vehicleId: vehicle.id,
                                                type: eventType, value: 1, timestamp: new Date(Number(timestamp))
                                            }
                                        })];
                                case 8:
                                    _d.sent();
                                    penalty = eventType === 'DROWSINESS' ? 0.5 : 0.2;
                                    newRating = Math.max(1.0, vehicle.driver.rating - penalty);
                                    return [4 /*yield*/, prisma.driver.update({ where: { id: vehicle.driver.id }, data: { rating: newRating } })];
                                case 9:
                                    _d.sent();
                                    _d.label = 10;
                                case 10:
                                    _i++;
                                    return [3 /*break*/, 7];
                                case 11: return [3 /*break*/, 13];
                                case 12:
                                    e_1 = _d.sent();
                                    console.error("Error processing record for ".concat(imei, ":"), e_1);
                                    return [3 /*break*/, 13];
                                case 13: return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < recordCount)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(i)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    response = Buffer.alloc(4);
                    response.writeUInt32BE(recordCount, 0);
                    socket.write(response);
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    socket.on('end', function () { return console.log('Client disconnected'); });
    socket.on('error', function (err) { return console.error('Socket error:', err); });
});
server.listen(PORT, function () {
    console.log("Teltonika TCP Server listening on port ".concat(PORT));
});
