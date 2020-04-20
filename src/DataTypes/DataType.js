"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataType = /** @class */ (function () {
    function DataType(value) {
        this.value = value instanceof Buffer
            ? this.read(value)
            : value;
        // Re-write the buffer from the read value
        // This is done in case the provided buffer was too large but still read correctly
        this.buffer = this.write(this.value);
    }
    return DataType;
}());
exports.DataType = DataType;
