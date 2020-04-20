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
var PacketSerializer = /** @class */ (function (_super) {
    __extends(PacketSerializer, _super);
    function PacketSerializer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // The packet currently being read
        _this.receivedBytes = Buffer.allocUnsafe(0);
        // The amount of bytes needed to finish the current packet
        _this.remainingBytes = 0;
        // A list of read packets that have not yet been read
        _this.buffer = [];
        // Whether we should push data live
        _this.reading = false;
        return _this;
    }
    /**
     * Handles incoming packets and serializes them
     */
    PacketSerializer.prototype._write = function (chunk, encoding, callback) {
        /* Packet Format:
        * Length   - VarInt
        * PacketId - VarInt
        * Data     - Buffer
        * */
        // If we are currently still reading a packet, read the amount of bytes it still needs
        if (this.remainingBytes !== 0) {
            var wantedChunk = chunk.slice(0, this.remainingBytes);
            chunk = chunk.slice(this.remainingBytes);
            this.receivedBytes = Buffer.concat([this.receivedBytes, wantedChunk]);
            this.remainingBytes -= wantedChunk.length;
            // If the packet has been fully read, add it to the buffer
            if (this.remainingBytes === 0)
                this.addPacket();
        }
        // If the whole buffer has been processed, fire the callback
        if (chunk.length === 0) {
            callback();
            return;
        }
        // If there is still data left, read it
        var packetLength = new VarInt_1.default(chunk);
        chunk = chunk.slice(packetLength.buffer.length);
        this.receivedBytes = packetLength.buffer;
        this.remainingBytes = packetLength.value;
        this._write(chunk, encoding, callback);
    };
    /**
     * Adds the current packet to the buffer
     */
    PacketSerializer.prototype.addPacket = function () {
        if (this.reading)
            this.reading = this.push(this.receivedBytes);
        else
            this.buffer.push(this.receivedBytes);
        this.receivedBytes = Buffer.allocUnsafe(0);
        this.remainingBytes = 0;
    };
    /**
     * Pushes data from the buffer when needed
     */
    PacketSerializer.prototype._read = function () {
        this.reading = true;
        while (this.reading && this.buffer.length) {
            this.reading = this.push(this.buffer.shift());
        }
        // If the writable stream has finished and the buffer is empty, end the readable stream
        if (this.buffer.length === 0 && this.writableFinished)
            this.push(null);
    };
    /**
     * Closes the readable stream after the writable stream has finished
     */
    PacketSerializer.prototype._final = function (callback) {
        // If the writable stream has finished and the read buffer is empty, also end the readable stream
        if (this.buffer.length === 0)
            this.push(null);
        callback();
    };
    return PacketSerializer;
}(stream_1.Duplex));
exports.default = PacketSerializer;
