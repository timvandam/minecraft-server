"use strict";
/*
This project is structured into a few modules
- Server Storage (Memory Store with server data)
- World Loader (Loads and writes worlds)
- Packet Serializer (Duplex stream. Buffers -> Stream -> Individual packets)
- Packet Reader (Writable EventEmitter that emits packet events). These can be used to write plugins
- Plugin Loader (Loads plugins somehow)
- The core minecraft server (it is a plugin!)
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var net_1 = require("net");
var config = __importStar(require("./config"));
var PacketReader_1 = __importDefault(require("./PacketReader"));
var PacketSerializer_1 = __importDefault(require("./PacketSerializer"));
var logger_1 = __importDefault(require("./logger"));
exports.server = new net_1.Server();
exports.server.on('connection', function (socket) {
    logger_1.default.verbose('Socket connected');
    socket.once('close', function () { return logger_1.default.verbose('Socket disconnected'); });
    socket.on('error', function (error) { return logger_1.default.verbose("An unexpected socket error occurred - " + error.message); });
    socket
        .pipe(new PacketSerializer_1.default()) // serialize incoming packets
        .pipe(new PacketReader_1.default()); // then read them
    // TODO: Attach plugins to PacketReader
});
exports.server.on('error', function (error) { return logger_1.default.error("An unexpected server error occurred - " + error.message); });
exports.server.listen({
    port: config.server.port
}, function () { return logger_1.default.info("Server listening on port " + config.server.port); });
