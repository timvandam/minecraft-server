"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("stream");
var VarInt_1 = __importDefault(require("../DataTypes/VarInt"));
var ESocketState_1 = require("../enums/ESocketState");
var PacketReader = /** @class */ (function (_super) {
    __extends(PacketReader, _super);
    function PacketReader() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // The state of the connected socket
        _this.state = ESocketState_1.ESocketState.HANDSHAKING;
        return _this;
    }
    /**
     * Reads a packet
     */
    PacketReader.prototype._write = function (packet, encoding, callback) {
        var packetLength = new VarInt_1.default(packet);
        packet = packet.slice(packetLength.buffer.length);
        var packetId = new VarInt_1.default(packet);
        packet = packet.slice(packetId.buffer.length);
        var data = packet;
        // TODO: read packet
        callback();
    };
    return PacketReader;
}(stream_1.Writable));
exports.default = PacketReader;
