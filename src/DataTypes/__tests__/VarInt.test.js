"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var VarInt_1 = __importDefault(require("../VarInt"));
describe('write works', function () {
    it('when providing valid values', function () {
        expect(new VarInt_1.default(128).buffer).toEqual(Buffer.from('8001', 'hex'));
        expect(new VarInt_1.default(2147483647).buffer).toEqual(Buffer.from('ffffffff07', 'hex'));
        expect(new VarInt_1.default(-1).buffer).toEqual(Buffer.from('ffffffff0f', 'hex'));
    });
    it('when providing invalid values', function () {
        expect(function () { return new VarInt_1.default(2147483647000); }).toThrow(new Error('Value is out of range'));
        expect(function () { return new VarInt_1.default(-2147483647000); }).toThrow(new Error('Value is out of range'));
    });
});
describe('read works', function () {
    it('when providing valid values', function () {
        expect(new VarInt_1.default(Buffer.from('ffffffff07', 'hex')).value).toBe(2147483647);
        expect(new VarInt_1.default(Buffer.from('8080808008', 'hex')).value).toBe(-2147483648);
        expect(new VarInt_1.default(Buffer.from('ffffffff0f', 'hex')).value).toBe(-1);
        expect(new VarInt_1.default(Buffer.from('ff01', 'hex')).value).toBe(255);
    });
    it('when providing too-big values', function () {
        expect(new VarInt_1.default(Buffer.from('0102', 'hex')).buffer).toEqual(Buffer.from('01', 'hex'));
    });
    it('when providing invalid values', function () {
        expect(function () { return new VarInt_1.default(Buffer.from('ffffffffffff', 'hex')); }).toThrow(new Error('VarInt is too big'));
        expect(function () { return new VarInt_1.default(Buffer.from('ffffffffffffffffff01', 'hex')); }).toThrow(new Error('VarInt is too big'));
    });
});
