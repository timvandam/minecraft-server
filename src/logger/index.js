"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = require("winston");
var path_1 = __importDefault(require("path"));
var config_1 = require("../config");
var File = winston_1.transports.File, Console = winston_1.transports.Console;
var LOGS = path_1.default.resolve(__dirname, '../../logs');
var combine = winston_1.format.combine, printf = winston_1.format.printf, timestamp = winston_1.format.timestamp, colorize = winston_1.format.colorize;
exports.default = winston_1.createLogger({
    transports: [
        new File({
            filename: path_1.default.resolve(LOGS, 'info.log'),
            level: 'info'
        }),
        new File({
            filename: path_1.default.resolve(LOGS, 'error.log'),
            level: 'error'
        }),
        new File({
            filename: path_1.default.resolve(LOGS, 'verbose.log'),
            level: 'verbose'
        }),
        new Console({
            level: config_1.logger.logLevel,
            format: combine(colorize(), timestamp(), printf(function (_a) {
                var level = _a.level, message = _a.message, timestamp = _a.timestamp;
                return timestamp + " [" + process.pid + "] [" + level + "] " + message;
            }))
        })
    ]
});
