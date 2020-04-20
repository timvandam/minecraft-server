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
Object.defineProperty(exports, "__esModule", { value: true });
var DataType_1 = require("./DataType");
var VarInt = /** @class */ (function (_super) {
    __extends(VarInt, _super);
    function VarInt() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VarInt.prototype.read = function (data) {
        var numRead = 0;
        var result = 0;
        var read = 0;
        do {
            read = data.readInt8(numRead);
            var value = (read & 127);
            result |= (value << (7 * numRead));
            numRead++;
            if (numRead > 5)
                throw new Error('VarInt is too big');
        } while ((read & 128) !== 0);
        return result;
    };
    VarInt.prototype.write = function (value) {
        if (value > 2147483647)
            throw new Error('Value is out of range');
        if (value < -2147483648)
            throw new Error('Value is out of range');
        var result = [];
        do {
            var temp = value & 127;
            value >>>= 7;
            if (value !== 0)
                temp |= 128;
            result.push(temp);
        } while (value !== 0);
        return Buffer.from(result);
    };
    return VarInt;
}(DataType_1.DataType));
exports.default = VarInt;
