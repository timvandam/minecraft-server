"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = {
    port: parseInt(process.env.PORT || '25565')
};
exports.logger = {
    logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'verbose'
};
